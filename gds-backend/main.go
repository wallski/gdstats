package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

const (
	gdServer        = "https://www.boomlings.com/database"
	gdSecret        = "Wmfd2893gb7"
	gdGameVersion   = "21"
	gdBinaryVersion = "35"
)

func enableCORS(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}
		next(w, r)
	}
}

func parseGDResponse(body string) map[string]string {
	result := make(map[string]string)
	parts := strings.Split(body, ":")
	for i := 0; i < len(parts)-1; i += 2 {
		if i+1 < len(parts) {
			result[parts[i]] = parts[i+1]
		}
	}
	return result
}

func decodeGDString(s string) string {
	decoded, err := url.QueryUnescape(s)
	if err != nil {
		return s
	}
	return decoded
}

func gdRequest(endpoint string, data url.Values) (string, error) {
	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("POST", gdServer+endpoint, strings.NewReader(data.Encode()))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	req.Header.Set("User-Agent", "")

	resp, err := client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}
	return string(bodyBytes), nil
}

func proxyIcon(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/icon/")
	parts := strings.Split(path, "/")
	if len(parts) < 2 {
		http.Error(w, `{"error":"invalid icon path"}`, http.StatusBadRequest)
		return
	}

	form := parts[0]
	iconID := parts[1]
	col1 := r.URL.Query().Get("col1")
	col2 := r.URL.Query().Get("col2")
	glow := r.URL.Query().Get("glow")

	// Map form names to gdicon API type names
	typeMap := map[string]string{
		"cube":    "cube",
		"ship":    "ship",
		"ball":    "ball",
		"ufo":     "ufo",
		"wave":    "wave",
		"robot":   "robot",
		"spider":  "spider",
		"swing":   "swing",
		"jetpack": "jetpack",
	}

	iconType := typeMap[form]
	if iconType == "" {
		iconType = "cube"
	}

	// Use oatmealine's gd-icon-renderer-web API
	iconURL := fmt.Sprintf("https://gdicon.oat.zone/icon.png?type=%s&value=%s", iconType, iconID)
	if col1 != "" {
		iconURL += "&color1=" + col1
	}
	if col2 != "" {
		iconURL += "&color2=" + col2
	}
	if glow == "1" || glow == "true" {
		iconURL += "&glow=1"
	}

	client := &http.Client{Timeout: 10 * time.Second}
	req, err := http.NewRequest("GET", iconURL, nil)
	if err != nil {
		http.Error(w, `{"error":"icon fetch failed"}`, http.StatusInternalServerError)
		return
	}

	resp, err := client.Do(req)
	if err != nil {
		// Fallback: try GDBrowser as backup
		fallbackURL := fmt.Sprintf("https://gdbrowser.com/icon/%s?form=%s", iconID, iconType)
		if col1 != "" {
			fallbackURL += "&col1=" + col1
		}
		if col2 != "" {
			fallbackURL += "&col2=" + col2
		}
		req2, _ := http.NewRequest("GET", fallbackURL, nil)
		resp2, err2 := client.Do(req2)
		if err2 != nil {
			http.Error(w, `{"error":"icon fetch failed"}`, http.StatusInternalServerError)
			return
		}
		defer resp2.Body.Close()
		w.Header().Set("Content-Type", resp2.Header.Get("Content-Type"))
		w.Header().Set("Cache-Control", "public, max-age=3600")
		io.Copy(w, resp2.Body)
		return
	}
	defer resp.Body.Close()

	w.Header().Set("Content-Type", resp.Header.Get("Content-Type"))
	w.Header().Set("Cache-Control", "public, max-age=3600")
	io.Copy(w, resp.Body)
}

func searchPlayers(query string) ([]PlayerSearchResult, error) {
	data := url.Values{}
	data.Set("gameVersion", gdGameVersion)
	data.Set("binaryVersion", gdBinaryVersion)
	data.Set("gdw", "0")
	data.Set("str", query)
	data.Set("total", "0")
	data.Set("page", "0")
	data.Set("secret", gdSecret)

	body, err := gdRequest("/getGJUsers20.php", data)
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(body) == "-1" || strings.TrimSpace(body) == "" {
		return []PlayerSearchResult{}, nil
	}

	players := []PlayerSearchResult{}
	entries := strings.Split(body, "|")
	for _, entry := range entries {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}
		fields := parseGDResponse(entry)

		accountID, _ := strconv.Atoi(fields["16"])
		if accountID == 0 {
			continue
		}

		stars, _ := strconv.Atoi(fields["3"])
		demons, _ := strconv.Atoi(fields["4"])
		icon, _ := strconv.Atoi(fields["9"])
		color1, _ := strconv.Atoi(fields["10"])
		color2, _ := strconv.Atoi(fields["11"])

		players = append(players, PlayerSearchResult{
			AccountID:  accountID,
			PlayerName: decodeGDString(fields["1"]),
			Stars:      stars,
			Demons:     demons,
			Icon:       icon,
			Color1:     color1,
			Color2:     color2,
		})
	}
	return players, nil
}

func getPlayerLevels(accountID int) ([]Level, error) {
	data := url.Values{}
	data.Set("gameVersion", gdGameVersion)
	data.Set("binaryVersion", gdBinaryVersion)
	data.Set("gdw", "0")
	data.Set("type", "5")
	data.Set("str", strconv.Itoa(accountID))
	data.Set("page", "0")
	data.Set("secret", gdSecret)

	body, err := gdRequest("/getGJLevels21.php", data)
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(body) == "-1" || strings.TrimSpace(body) == "" {
		return []Level{}, nil
	}

	parts := strings.Split(body, "#")
	if len(parts) == 0 {
		return []Level{}, nil
	}

	levels := []Level{}
	entries := strings.Split(parts[0], "|")
	for _, entry := range entries {
		entry = strings.TrimSpace(entry)
		if entry == "" {
			continue
		}
		fields := parseGDResponse(entry)

		levelID, _ := strconv.Atoi(fields["1"])
		if levelID == 0 {
			continue
		}

		stars, _ := strconv.Atoi(fields["18"])
		downloads, _ := strconv.Atoi(fields["10"])
		likes, _ := strconv.Atoi(fields["14"])

		difficulty := "Unrated"
		diff := fields["9"]
		auto := fields["25"] == "1"
		demon := fields["17"] == "1"

		if auto {
			difficulty = "Auto"
		} else if demon {
			demonDiff, _ := strconv.Atoi(fields["43"])
			switch demonDiff {
			case 3:
				difficulty = "Easy Demon"
			case 4:
				difficulty = "Medium Demon"
			case 0, 5:
				difficulty = "Hard Demon"
			case 6:
				difficulty = "Insane Demon"
			case 7:
				difficulty = "Extreme Demon"
			default:
				difficulty = "Demon"
			}
		} else {
			diffNum, _ := strconv.Atoi(diff)
			switch diffNum {
			case 0:
				difficulty = "Unrated"
			case 10:
				difficulty = "Easy"
			case 20:
				difficulty = "Normal"
			case 30:
				difficulty = "Hard"
			case 40:
				difficulty = "Harder"
			case 50:
				difficulty = "Insane"
			}
		}

		levels = append(levels, Level{
			LevelID:    levelID,
			Name:       decodeGDString(fields["2"]),
			Author:     decodeGDString(fields["6"]),
			Difficulty: difficulty,
			Stars:      stars,
			Downloads:  downloads,
			Likes:      likes,
		})
	}
	return levels, nil
}

func getPlayerProfile(accountID int) (*PlayerProfile, error) {
	data := url.Values{}
	data.Set("gameVersion", gdGameVersion)
	data.Set("binaryVersion", gdBinaryVersion)
	data.Set("gdw", "0")
	data.Set("targetAccountID", strconv.Itoa(accountID))
	data.Set("secret", gdSecret)

	body, err := gdRequest("/getGJUserInfo20.php", data)
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(body) == "-1" || strings.TrimSpace(body) == "" {
		return nil, fmt.Errorf("player not found")
	}

	fields := parseGDResponse(body)

	stars, _ := strconv.Atoi(fields["3"])
	demons, _ := strconv.Atoi(fields["4"])
	diamonds, _ := strconv.Atoi(fields["46"])
	coins, _ := strconv.Atoi(fields["13"])
	userCoins, _ := strconv.Atoi(fields["17"])
	creatorPoints, _ := strconv.Atoi(fields["8"])
	icon, _ := strconv.Atoi(fields["21"])
	ship, _ := strconv.Atoi(fields["22"])
	ball, _ := strconv.Atoi(fields["23"])
	ufo, _ := strconv.Atoi(fields["24"])
	wave, _ := strconv.Atoi(fields["25"])
	robot, _ := strconv.Atoi(fields["26"])
	spider, _ := strconv.Atoi(fields["43"])
	color1, _ := strconv.Atoi(fields["10"])
	color2, _ := strconv.Atoi(fields["11"])
	color3, _ := strconv.Atoi(fields["51"])
	glow := fields["28"] == "1"
	moons, _ := strconv.Atoi(fields["52"])
	swing, _ := strconv.Atoi(fields["53"])
	jetpack, _ := strconv.Atoi(fields["54"])
	playerName := decodeGDString(fields["1"])

	levels, _ := getPlayerLevels(accountID)

	profile := &PlayerProfile{
		AccountID:     accountID,
		PlayerName:    playerName,
		Stars:         stars,
		Demons:        demons,
		Diamonds:      diamonds,
		Coins:         coins,
		UserCoins:     userCoins,
		CreatorPoints: creatorPoints,
		Icon:          icon,
		Ship:          ship,
		Ball:          ball,
		UFO:           ufo,
		Wave:          wave,
		Robot:         robot,
		Spider:        spider,
		Color1:        color1,
		Color2:        color2,
		Color3:        color3,
		Glow:          glow,
		Moons:         moons,
		Swing:         swing,
		Jetpack:       jetpack,
		YouTube:       fields["20"],
		Twitter:       fields["44"],
		Twitch:        fields["45"],
		LevelsCreated: levels,
	}

	return profile, nil
}

func handleSearch(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("query")
	if query == "" {
		json.NewEncoder(w).Encode([]PlayerSearchResult{})
		return
	}

	players, err := searchPlayers(query)
	if err != nil {
		http.Error(w, `{"error":"search failed"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(players)
}

func handleProfile(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/api/profile/")
	accountID, err := strconv.Atoi(path)
	if err != nil {
		http.Error(w, `{"error":"invalid account ID"}`, http.StatusBadRequest)
		return
	}

	profile, err := getPlayerProfile(accountID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/search", enableCORS(handleSearch))
	mux.HandleFunc("/api/profile/", enableCORS(handleProfile))
	mux.HandleFunc("/api/icon/", enableCORS(proxyIcon))

	port := ":8080"
	log.Printf("GD Backend server starting on http://localhost%s", port)
	log.Fatal(http.ListenAndServe(port, mux))
}

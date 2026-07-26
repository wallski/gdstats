package lib

import (
	"fmt"
	"io"
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

// ParseGDResponse parses the colon-separated key:value:key:value GD response format.
func ParseGDResponse(body string) map[string]string {
	result := make(map[string]string)
	parts := strings.Split(body, ":")
	for i := 0; i < len(parts)-1; i += 2 {
		if i+1 < len(parts) {
			result[parts[i]] = parts[i+1]
		}
	}
	return result
}

// DecodeGDString URL-decodes a GD string (e.g. player names).
func DecodeGDString(s string) string {
	decoded, err := url.QueryUnescape(s)
	if err != nil {
		return s
	}
	return decoded
}

// GdRequest makes a POST request to the GD server at the given endpoint.
func GdRequest(endpoint string, data url.Values) (string, error) {
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

// SearchPlayers searches for GD players by username.
func SearchPlayers(query string) ([]PlayerSearchResult, error) {
	data := url.Values{}
	data.Set("gameVersion", gdGameVersion)
	data.Set("binaryVersion", gdBinaryVersion)
	data.Set("gdw", "0")
	data.Set("str", query)
	data.Set("total", "0")
	data.Set("page", "0")
	data.Set("secret", gdSecret)

	body, err := GdRequest("/getGJUsers20.php", data)
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
		fields := ParseGDResponse(entry)

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
			PlayerName: DecodeGDString(fields["1"]),
			Stars:      stars,
			Demons:     demons,
			Icon:       icon,
			Color1:     color1,
			Color2:     color2,
		})
	}
	return players, nil
}

// GetPlayerLevels fetches all published levels for a given account ID.
func GetPlayerLevels(accountID int) ([]Level, error) {
	data := url.Values{}
	data.Set("gameVersion", gdGameVersion)
	data.Set("binaryVersion", gdBinaryVersion)
	data.Set("gdw", "0")
	data.Set("type", "5")
	data.Set("str", strconv.Itoa(accountID))
	data.Set("page", "0")
	data.Set("secret", gdSecret)

	body, err := GdRequest("/getGJLevels21.php", data)
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
		fields := ParseGDResponse(entry)

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
			Name:       DecodeGDString(fields["2"]),
			Author:     DecodeGDString(fields["6"]),
			Difficulty: difficulty,
			Stars:      stars,
			Downloads:  downloads,
			Likes:      likes,
		})
	}
	return levels, nil
}

// GetPlayerProfile fetches the full profile (including levels) for a given account ID.
func GetPlayerProfile(accountID int) (*PlayerProfile, error) {
	data := url.Values{}
	data.Set("gameVersion", gdGameVersion)
	data.Set("binaryVersion", gdBinaryVersion)
	data.Set("gdw", "0")
	data.Set("targetAccountID", strconv.Itoa(accountID))
	data.Set("secret", gdSecret)

	body, err := GdRequest("/getGJUserInfo20.php", data)
	if err != nil {
		return nil, err
	}

	if strings.TrimSpace(body) == "-1" || strings.TrimSpace(body) == "" {
		return nil, fmt.Errorf("player not found")
	}

	fields := ParseGDResponse(body)

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
	playerName := DecodeGDString(fields["1"])

	levels, _ := GetPlayerLevels(accountID)

	return &PlayerProfile{
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
	}, nil
}

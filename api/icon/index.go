package handler

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Handler serves /api/icon and /api/icon/:form/:id
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/icon")
	path = strings.Trim(path, "/")

	parts := strings.Split(path, "/")
	if len(parts) < 2 || parts[0] == "" || parts[1] == "" {
		http.Error(w, `{"error":"invalid icon path"}`, http.StatusBadRequest)
		return
	}

	form := parts[0]
	iconID := parts[1]
	col1 := r.URL.Query().Get("col1")
	col2 := r.URL.Query().Get("col2")
	glow := r.URL.Query().Get("glow")

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

	resp, err := client.Get(iconURL)
	if err != nil || resp.StatusCode != http.StatusOK {
		if resp != nil {
			resp.Body.Close()
		}
		fallbackURL := fmt.Sprintf("https://gdbrowser.com/icon/%s?form=%s", iconID, iconType)
		if col1 != "" {
			fallbackURL += "&col1=" + col1
		}
		if col2 != "" {
			fallbackURL += "&col2=" + col2
		}
		resp2, err2 := client.Get(fallbackURL)
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

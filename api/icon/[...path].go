package handler

import (
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

// Handler serves /api/icon/[...path].
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var form, iconID string

	// Method 1: Try path array from Vercel query string (?path=cube&path=457)
	pathSlice := r.URL.Query()["path"]
	if len(pathSlice) >= 2 {
		form = pathSlice[0]
		iconID = pathSlice[1]
	} else if len(pathSlice) == 1 {
		pParts := strings.Split(strings.Trim(pathSlice[0], "/"), "/")
		if len(pParts) >= 2 {
			form = pParts[0]
			iconID = pParts[1]
		}
	}

	// Method 2: Fallback to raw URL Path parsing (/api/icon/cube/457)
	if form == "" || iconID == "" {
		rawPath := strings.TrimPrefix(r.URL.Path, "/api/icon/")
		rawPath = strings.Trim(rawPath, "/")
		pParts := strings.Split(rawPath, "/")
		if len(pParts) >= 2 {
			form = pParts[0]
			iconID = pParts[1]
		}
	}

	if form == "" || iconID == "" {
		http.Error(w, `{"error":"invalid icon path"}`, http.StatusBadRequest)
		return
	}

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

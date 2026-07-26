package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	lib "github.com/wallski/gdstats/lib"
)

// Handler serves /api/profile and /api/profile/:id
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	path := strings.TrimPrefix(r.URL.Path, "/api/profile")
	path = strings.Trim(path, "/")

	if path == "" {
		path = r.URL.Query().Get("id")
	}

	accountID, err := strconv.Atoi(path)
	if err != nil || accountID == 0 {
		http.Error(w, `{"error":"invalid account ID"}`, http.StatusBadRequest)
		return
	}

	profile, err := lib.GetPlayerProfile(accountID)
	if err != nil {
		http.Error(w, fmt.Sprintf(`{"error":"%s"}`, err.Error()), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(profile)
}

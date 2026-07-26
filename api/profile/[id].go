package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	lib "github.com/wallski/gdstats/lib"
)

// Handler serves /api/profile/[id].
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	var accountID int

	idSlice := r.URL.Query()["id"]
	if len(idSlice) > 0 {
		accountID, _ = strconv.Atoi(idSlice[0])
	}

	if accountID == 0 {
		pathStr := strings.TrimPrefix(r.URL.Path, "/api/profile/")
		pathStr = strings.Trim(pathStr, "/")
		accountID, _ = strconv.Atoi(pathStr)
	}

	if accountID == 0 {
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

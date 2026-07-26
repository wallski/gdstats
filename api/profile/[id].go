package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	lib "github.com/wallski/gdstats/lib"
)

// Handler serves /api/profile/[id].
// Vercel injects the dynamic [id] segment as the "id" query parameter.
func Handler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}

	idStr := r.URL.Query().Get("id")
	accountID, err := strconv.Atoi(idStr)
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

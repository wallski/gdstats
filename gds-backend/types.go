package main

type PlayerSearchResult struct {
	AccountID  int    `json:"accountID"`
	PlayerName string `json:"playerName"`
	Stars      int    `json:"stars"`
	Demons     int    `json:"demons"`
	Icon       int    `json:"icon"`
	Color1     int    `json:"color1"`
	Color2     int    `json:"color2"`
}

type Level struct {
	LevelID    int    `json:"levelID"`
	Name       string `json:"name"`
	Author     string `json:"author"`
	Difficulty string `json:"difficulty"`
	Stars      int    `json:"stars"`
	Downloads  int    `json:"downloads"`
	Likes      int    `json:"likes"`
}

type PlayerProfile struct {
	AccountID     int     `json:"accountID"`
	PlayerName    string  `json:"playerName"`
	Stars         int     `json:"stars"`
	Demons        int     `json:"demons"`
	Diamonds      int     `json:"diamonds"`
	Coins         int     `json:"coins"`
	UserCoins     int     `json:"userCoins"`
	CreatorPoints int     `json:"creatorPoints"`
	Icon          int     `json:"icon"`
	Ship          int     `json:"ship"`
	Ball          int     `json:"ball"`
	UFO           int     `json:"ufo"`
	Wave          int     `json:"wave"`
	Robot         int     `json:"robot"`
	Spider        int     `json:"spider"`
	Color1        int     `json:"color1"`
	Color2        int     `json:"color2"`
	Color3        int     `json:"color3"`
	Glow          bool    `json:"glow"`
	Moons         int     `json:"moons"`
	Swing         int     `json:"swing"`
	Jetpack       int     `json:"jetpack"`
	YouTube       string  `json:"youtube"`
	Twitter       string  `json:"twitter"`
	Twitch        string  `json:"twitch"`
	LevelsCreated []Level `json:"levelsCreated"`
}

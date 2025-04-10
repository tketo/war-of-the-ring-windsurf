export interface GameState {
    gameId:        string;
    players:       Player[];
    currentPhase:  string;
    currentTurn:   number;
    currentPlayer: string;
    actionDice:    ActionDice;
    characters:    Character[];
    regions:       Region[];
    cards:         Cards;
    history:       History[];
    settings:      Settings;
}

export interface ActionDice {
    freePeoples: string[];
    shadow:      string[];
}

export interface Cards {
    eventDeck:     string[];
    eventDiscard:  any[];
    combatDeck:    string[];
    combatDiscard: any[];
    playerHands:   PlayerHands;
}

export interface PlayerHands {
    player1: string[];
    player2: string[];
}

export interface Character {
    characterId: string;
    location:    string;
    status:      string;
    modifiers:   string[];
}

export interface History {
    state:     State;
    action:    Action;
    player:    string;
    committed: boolean;
    timestamp: number;
}

export interface Action {
    type:   string;
    player: string;
}

export interface State {
}

export interface Player {
    playerId: string;
    faction:  string;
    role:     string;
    isActive: boolean;
}

export interface Region {
    regionId:     string;
    controlledBy: string;
    units:        Unit[];
}

export interface Unit {
    type:    string;
    count:   number;
    faction: string;
}

export interface Settings {
    mode:       string;
    expansions: any[];
    scenario:   string;
}

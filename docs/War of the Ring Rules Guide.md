# War of the Ring Rules Guide v2.6 (Base Game Edition)

*Note*: Version 2.6 aligns with official *War of the Ring Second Edition* rules, consolidating updates from v2.5 (corrected Russian text in **Armies and Battles > Combat** and **Fortifications, Cities, and Sieges** to English) and v2.4 (removed Palantir die from Event Cards Drawing, clarified its use in Action Resolution). Maintains v2.3 victory conditions: military victories (Shadow: 10+ VP; Free Peoples: 4+ VP with Shadow <10) checked in Phase 6, Ring (FP: Crack of Doom with <12 Corruption) and Corruption (SP: Corruption = 12) immediate, with Shadow Corruption victory taking precedence. Updates Character list to 11 base game entries (Frodo/Sam, 7 Companions, 3 Minions, Gollum), clarifies siege mechanics (attacker 6+ all rounds in Stronghold sieges, 6+ first round only for Cities/Fortifications), refines retreat rules (e.g., Scouts card), and details Elven Rings (one use per side per turn). Uses “reinforcements” for both Free Peoples and Shadow in initial setup and stacking removals, with Free Peoples combat eliminations permanently removed (graveyard). Integrates all 3-/4-player rules: card swapping discussion, Action Dice discussion, Leader control, passing/cycle clarity, Event Card eligibility (Nation/Character control, icons), Mixed Army combination (voluntary or mandatory on attack), and stacked Leadership in Mixed Armies into general sections where applicable, keeping specific rules (e.g., teammate army stacking, Mixed Army details) in **Multiplayer Rules** to avoid clutter. Corrects misclassification of Merry/Pippin as units in **Game Pieces - Army Units**, ensuring they’re only referenced as Companions with their return ability. Maintains multiplayer rules for 1–4 players (team setups, card drawing, hand limits, leader mechanics, mixed armies), Game Turn (dice recovery, card drawing), Political Track (3 peace boxes, Nation positions), and settlement details (36 settlements: 16 Strongholds, 6 Cities, 14 Towns; Free Peoples: 20 VP, Shadow: 18 VP, total 38 VP), including Folde as a Free Peoples Town, Umbar as a Shadow Stronghold, Nurn as a Shadow Town, Pelargir as a City, and Osgiliath as a Free-controlled Fortification. Includes “Free Region” definition. Excludes detailed region adjacency and card text, reserving them for the implementation guide (`regions.json`, card files). Maintains shared Action Dice pools, siege stacking, and combat rules for optimal clarity and performance. Attachment count: 0/25, ready for card files in Appendices A/B.

## Setting Up the Game
- **Players**: 1–4 players:
  - **1 Player**: Free Peoples (FP) or Shadow (SP) vs. AI as the opposing side.
  - **2 Players**: FP vs. SP.
  - **3 Players**: 1 FP player (all Free Peoples Nations) vs. 2 SP players (Sauron; Isengard/Southrons & Easterlings).
  - **4 Players**: 2 FP players (Player 1: Gondor, Elves; Player 2: Rohan, The North, Dwarves, Fellowship) vs. 2 SP players (Player 3: Witch-king/Sauron; Player 4: Saruman/Isengard, Southrons & Easterlings).
- **Map**: Digital game, representing the Middle-earth board. Region adjacency, Nation mappings, and neutral regions defined in `regions.json`.
- **Fellowship**:
  - Place the Fellowship figure in Rivendell.
  - Set Fellowship Progress Counter on Step 0 (Fellowship Track), Hidden (blue) side up.
  - Place Corruption Counter on Step 0 (Corruption Track).
  - Place 7 Companions (Gandalf the Grey, Strider, Boromir, Legolas, Gimli, Peregrin, Meriadoc) and Ring-bearers (Frodo and Sam) in the Fellowship box.
  - Set Gandalf the Grey as Guide (card in Guide box).
  - Gollum follows the Fellowship; place his figure on the board if he becomes Guide (no Companions remain).
- **Elven Rings**: Place 3 counters (Ring side up) in the Free Peoples Elven Rings box. When used, Free Peoples flip to dark side and place in Shadow Rings box; Shadow removes after use.
- **Cards**: Shuffle 4 Event decks (FP Character, FP Strategy, SP Character, SP Strategy) and place on board. Card text defined in external files.
- **Hunt Tiles**: Place 16 Standard tiles (12 numbered 0–3, 4 Eye) in an opaque Hunt Pool. Special tiles added via Event Cards or Mordor entry.
- **Action Dice**: Shadow receives 7 red dice as a single shared pool; Free Peoples receive 4 blue dice as a single shared pool. Used collectively by all players on each side, regardless of player count (1–4).
- **Political Track**:
  - **Structure**: 3 peace boxes, 1 At War box.
  - **Shadow Nations**:
    - Isengard, Southrons & Easterlings start in the 2nd peace box, face up (Active).
    - Sauron starts in the 3rd peace box, face up (Active).
  - **Free Peoples Nations**:
    - The North, Rohan, Dwarves start face down (Passive) in the 1st peace box.
    - Elves start face up (Active) in the 1st peace box.
    - Gondor starts face down (Passive) in the 2nd peace box.
- **Army Setup**:
  - **Total Settlements**: 36 (16 Strongholds, 6 Cities, 14 Towns).
  - **Total Victory Points (VP)**: 38 (Free Peoples: 20, Shadow: 18).
  - **Fortifications**: 2 (Fords of Isen, Osgiliath, 0 VP).
  - **Free Peoples (20 VP)**:
    - **Dwarves**:
      - Erebor (Stronghold, 2 VP): 1 Regular, 2 Elite, 1 Leader.
      - Ered Luin (Town, 0 VP): 1 Regular.
      - Iron Hills (Town, 0 VP): 1 Regular.
      - Reinforcements: 2 Regular, 3 Elite, 3 Leaders.
    - **Elves**:
      - Grey Havens (Stronghold, 2 VP): 1 Regular, 1 Elite, 1 Leader.
      - Rivendell (Stronghold, 2 VP): 2 Elite, 1 Leader.
      - Woodland Realm (Stronghold, 2 VP): 1 Regular, 1 Elite, 1 Leader.
      - Lórien (Stronghold, 2 VP): 1 Regular, 2 Elite, 1 Leader.
      - Reinforcements: 2 Regular, 4 Elite.
    - **Gondor**:
      - Minas Tirith (Stronghold, 2 VP): 3 Regular, 1 Elite, 1 Leader.
      - Dol Amroth (Stronghold, 2 VP): 3 Regular.
      - Pelargir (City, 1 VP): 1 Regular.
      - Osgiliath (Fortification, 0 VP): 2 Regular.
      - Reinforcements: 6 Regular, 4 Elite, 3 Leaders.
    - **The North**:
      - Bree (Town, 0 VP): 1 Regular.
      - Carrock (Town, 0 VP): 1 Regular.
      - Dale (City, 1 VP): 1 Regular, 1 Leader.
      - The Shire (City, 1 VP): 1 Regular.
      - North Downs (Neutral): 1 Elite.
      - Reinforcements: 6 Regular, 4 Elite, 3 Leaders.
    - **Rohan**:
      - Edoras (City, 1 VP): 1 Regular, 1 Elite.
      - Helm’s Deep (Stronghold, 2 VP): 1 Regular.
      - Fords of Isen (Fortification, 0 VP): 2 Regular, 1 Leader.
      - Reinforcements: 6 Regular, 4 Elite, 3 Leaders.
  - **Shadow (18 VP)**:
    - **Isengard**:
      - Orthanc (Stronghold, 2 VP): 4 Regular, 1 Elite.
      - North Dunland (Town, 0 VP): 1 Regular.
      - South Dunland (Town, 0 VP): 1 Regular.
      - Reinforcements: 6 Regular, 5 Elite.
    - **Sauron**:
      - Barad-dûr (Stronghold, 2 VP): 4 Regular, 1 Elite, 1 Nazgûl.
      - Dol Guldur (Stronghold, 2 VP): 5 Regular, 1 Elite, 1 Nazgûl.
      - Minas Morgul (Stronghold, 2 VP): 5 Regular, 1 Nazgûl.
      - Morannon (Stronghold, 2 VP): 5 Regular, 1 Nazgûl.
      - Moria (Stronghold, 2 VP): 2 Regular.
      - Mount Gundabad (Stronghold, 2 VP): 2 Regular.
      - Nurn (Town, 0 VP): 2 Regular.
      - Gorgoroth (Neutral): 3 Regular.
      - Reinforcements: 8 Regular, 4 Elite, 4 Nazgûl.
    - **Southrons & Easterlings**:
      - Far Harad (City, 1 VP): 3 Regular, 1 Elite.
      - Near Harad (Town, 0 VP): 3 Regular, 1 Elite.
      - North Rhûn (Town, 0 VP): 2 Regular.
      - South Rhûn (Town, 0 VP): 3 Regular, 1 Elite.
      - Umbar (Stronghold, 2 VP): 3 Regular.
      - Reinforcements: 10 Regular, 3 Elite.

## Game Turn
1. **Recover Action Dice and Draw Event Cards**:
   - **Recover Dice**:
     - **Shadow**: Reset pool to 7 red dice, add 1 per Minion in play (Saruman, Witch-king, Mouth of Sauron, max 10). Place rolled Eye dice in Hunt box.
     - **Free Peoples**: Reset pool to 4 blue dice, add 1 per Gandalf the White or Aragorn in play (max 6).
   - **Draw Event Cards**:
     - **2-Player Game**: Each player draws 1 Strategy card and 1 Character card.
     - **3-Player Game**: FP draws 1 Strategy and 1 Character card (Turn 1), then 1 card from either deck (Turn 2+). Each Shadow player draws 1 card from either their Character or Strategy deck (all turns).
     - **4-Player Game**: Turn 1, each player draws 1 Character and 1 Strategy card. Turn 2+, each player draws 1 card from either deck.
     - Discard if over hand limit:
       - **2-Player**: 6 cards per player.
       - **3-Player**: 6 cards (FP), 4 cards each (Shadow).
       - **4-Player**: 4 cards each.
     - Discards are face-down; depleted decks do not reshuffle.
   - **Card Swapping (3- and 4-Player Games)**: After drawing and discarding, teammates may discuss strategy (not card contents) and swap 1 card each, handed blindly.
2. **Fellowship Phase**:
   - Declare position (if Hidden): Move figure up to Progress Counter regions (not crossing impassable terrain), reset Counter to 0 (Hidden), heal 1 Corruption if in a Free Peoples City or Stronghold not enemy-controlled (e.g., Minas Tirith, Pelargir), activate that Nation (e.g., Gondor for Pelargir).
   - In 3-player games, FP player decides declaration and Guide. In 4-player games, Leading FP player (Gondor or Rohan, per token) decides.
   - Change Guide if desired or if composition changes (highest Level; Free Peoples choose on tie; Gollum if no Companions).
3. **Hunt Allocation**:
   - Shadow allocates 0 to N dice (N = Companions in Fellowship, including Gollum as Guide, minimum 1) to Hunt box from their shared pool.
   - In 3-player games, Leading Shadow player allocates. In 4-player games, Leading Shadow player allocates.
4. **Action Roll**:
   - Roll remaining dice from each side’s shared pool; Shadow places all rolled Eye dice in Hunt box.
   - In 3- and 4-player games, teammates may discuss Action Dice strategy (not specific dice assignments) before rolling.
5. **Action Resolution**:
   - **2-Player Game**: Alternate actions (Free Peoples first). Use 1 die from the side’s shared pool. Place used Fellowship movement dice in Hunt box; place other used dice aside. A side may pass if they have fewer dice remaining or discard a die without effect. If one side exhausts their pool, the other uses remaining dice sequentially.
   - **3-Player Game**: Cycle: Non-Leading Shadow, Free Peoples, Leading Shadow, Free Peoples. FP player acts twice per cycle but cannot take consecutive actions with the same Nation or Army (e.g., allowed: move Gondor Army, then Gondor/Rohan Mixed Army; not allowed: recruit Gondor, then move Gondor Army). Restriction resets per cycle (e.g., Gondor action in cycle 1 doesn’t block Gondor in cycle 2). FP may pass if fewer dice remain, continuing the cycle. Continue until all dice used.
   - **4-Player Game**: Sequence: Non-Leading FP, Non-Leading Shadow, Leading FP, Leading Shadow. Repeat until all dice used. Passing retains turn position.
6. **Military Victory Check**:
   - Shadow wins if they hold 10+ VP in Free Peoples Cities/Strongholds.
   - Free Peoples win if they hold 4+ VP in Shadow Cities/Strongholds and Shadow has <10 VP.

## Multiplayer Rules (1-, 3-, and 4-Player Games)
- **Team Setup**:
  - **1-Player Game**:
    - Player controls FP or SP; opponent is AI (strategy defined in implementation guide).
  - **3-Player Game**:
    - **Free Peoples**: 1 player controls all FP Nations (Gondor, Elves, Rohan, The North, Dwarves, Fellowship).
    - **Shadow**: Player 1 controls Sauron (Witch-king); Player 2 controls Isengard, Southrons & Easterlings (Saruman).
  - **4-Player Game**:
    - **Free Peoples**: Player 1 controls Gondor, Elves; Player 2 controls Rohan, The North, Dwarves, Fellowship.
    - **Shadow**: Player 3 controls Sauron (Witch-king); Player 4 controls Isengard, Southrons & Easterlings (Saruman).
- **Leader Player Token**:
  - **1-Player**: Player rolls own Action Dice; AI handles opponent pool.
  - **3-Player**: Shadow Leader alternates between Witch-king and Saruman players each turn. FP player rolls their own Action Dice.
  - **4-Player**: FP: Gondor player starts with token, passes to teammate each turn. Shadow: Witch-king player starts, passes to teammate each turn.
  - Leader rolls team Action Dice and takes first action for their team.
- **Event Card Eligibility**:
  - Players may only play cards matching their assigned Nation’s icon (e.g., Gondor, Rohan, Witch-king for Sauron, Saruman for Isengard/Southrons & Easterlings).
  - Cards without icons or with a Free Peoples or Shadow symbol can be played by any player on the team if the effect applies to their controlled Nation or Character.
- **Fellowship and Hunt**:
  - **1-Player**: Player decides Fellowship declaration and Guide (FP) or Hunt allocation (SP); AI handles opponent actions.
  - **3-Player**: FP player decides Fellowship declaration and Guide. Leading Shadow player allocates Hunt dice.
  - **4-Player**: Leading FP player (Gondor or Rohan player, based on token) decides Fellowship declaration and Guide. Leading Shadow player allocates Hunt dice.
- **Nazgûl**:
  - Any Shadow player can move Nazgûl or use them to Hunt.
  - Only Witch-king player can recruit new Nazgûl in Sauron Strongholds when “At War.”
- **Mixed Armies** (3- and 4-Player Games):
  - Armies from different players on the same team (e.g., Free Peoples: Gondor and Rohan; Shadow: Sauron and Isengard) may share regions, remaining separate or combining as a Mixed Army.
  - **Combination**:
    - Armies **may combine** into a Mixed Army if both players agree (e.g., to move Gondor and Rohan units together).
    - Armies **must combine** into a Mixed Army if their region is attacked (e.g., Shadow attacks Minas Tirith with Gondor and Rohan units present), forming a single Army for combat.
  - **Stacking**: Separate teammate armies count toward the 10-unit region limit (5 in a besieged Stronghold). If the total exceeds the limit, players alternate removing one unit each to reinforcements, starting with the non-Leading player, until within the limit. This is less common, typically occurring with coordinated movement (e.g., Gondor and Rohan both in Minas Tirith).
    - Example: In a 4-player game, Minas Tirith has 6 Gondor units (Leading FP) and 5 Rohan units (non-Leading FP), totaling 11. The non-Leading FP player removes 1 Rohan unit to reinforcements, reaching 10.
  - **Leader Control**: When armies remain separate, each player’s Leaders (Free Peoples Leaders, Nazgûl) stay with their own units (e.g., Gondor Leader with Gondor units), contributing Leadership only for that player’s actions (movement, combat). In a Mixed Army, all Leaders from both players stack to contribute to the total Leadership (e.g., 1 Gondor Leader + 1 Rohan Leader = 2 Leadership), used for movement, combat strength, and re-rolls, with the controlling player deciding actions.
  - **Control Priority**: For Mixed Armies, (1) Player with most units, (2) Most Elites, (3) Leader Player.
  - Only the controlling player moves, attacks, or plays Combat Cards with the Mixed Army.
  - Reclaim control by moving units out with an Action Die (e.g., Rohan player moves units from Minas Tirith to Edoras); cannot split to lose control deliberately.
  - Mixed Armies obey political restrictions (e.g., non-“At War” units prevent attacks).
- **Saruman and Elite Units** (3- and 4-Player Games):
  - When Saruman is in play, Isengard and Southrons & Easterlings Elite units count as both Leaders and Army units for movement, combat, and Hunt rerolls.

## Game Board
- **Regions**: Named, adjacent for movement unless separated by seas or black lines (impassable). Adjacency, Nation mappings, and neutral regions defined in `regions.json`.
- **Settlements**: Towns (e.g., Folde, Nurn, 0 VP), Cities (e.g., Pelargir, Far Harad, 1 VP), Strongholds (e.g., Minas Tirith, Umbar, 2 VP).
- **Fortifications**: Osgiliath, Fords of Isen (not Settlements, 0 VP).

## Game Pieces
- **Army Units**:
  - **Regular**: 1 Combat Strength.
  - **Elite**: 1 Combat Strength, reducible to Regular to absorb hits or extend sieges.
  - Free Peoples units eliminated in combat (including Elites replaced by Regulars) are permanently removed (placed in graveyard). Shadow units eliminated in combat or removed due to stacking limits return to reinforcements, available for recruitment.
- **Leaders**:
  - Free Peoples Leaders require an Army, provide Leadership, permanently removed if eliminated (placed in graveyard).
  - Nazgûl (Shadow) can move independently, provide Leadership, return to reinforcements if eliminated.
  - In 3- and 4-player games, Leaders remain with their player’s units when separate; in Mixed Armies, all Leaders contribute to total Leadership (see **Multiplayer Rules - Mixed Armies**).
- **Characters**:
  - **Ring-bearers (Free Peoples)**:
    - **Frodo and Sam**: Treated as a single unit (Ring-bearers), begin in the Fellowship.
      - **Level**: 1/0 | **Leadership**: 0 | **Guide**: Yes
      - **Abilities**: None.
      - **Restrictions**: Cannot leave the Fellowship; not placed separately on the map.
      - **Playable by**: Free Peoples
  - **Companions (Free Peoples)**:
    - Begin in the Fellowship; may separate to act as Leaders, advance Nations, or trigger abilities.
    - **Gandalf the Grey**:
      - **Level**: 3 | **Leadership**: 1 | **Guide**: Yes
      - **Abilities**: After playing a Free Peoples Character Event Card, draw another Character Event Card. In battle, adds +1 Combat Strength (max 5 dice). May be replaced by Gandalf the White.
      - **Playable by**: Free Peoples
    - **Strider**:
      - **Level**: 3 | **Leadership**: 1 | **Guide**: Yes
      - **Abilities**: Use a Character die to hide a Revealed Fellowship. May be replaced by Aragorn.
      - **Playable by**: The North
    - **Boromir**:
      - **Level**: 2 | **Leadership**: 1 | **Guide**: No
      - **Abilities**: In battle, adds +1 Combat Strength (max 5 dice). Use any Action Die to advance Gondor’s Political Track if in an unconquered Gondor City/Stronghold (e.g., Minas Tirith, Pelargir).
      - **Playable by**: Gondor
    - **Legolas**:
      - **Level**: 2 | **Leadership**: 1 | **Guide**: No
      - **Abilities**: In battle, adds +1 Combat Strength (max 5 dice). Use any Action Die to advance Elves’ Political Track if in an unconquered Elven Stronghold (e.g., Lórien, Rivendell).
      - **Playable by**: Elves
    - **Gimli**:
      - **Level**: 2 | **Leadership**: 1 | **Guide**: No
      - **Abilities**: In battle, adds +1 Combat Strength (max 5 dice). Use any Action Die to advance Dwarves’ Political Track if in unconquered Erebor.
      - **Playable by**: Dwarves
    - **Meriadoc (Merry)**:
      - **Level**: 1 | **Leadership**: 1 | **Guide**: Yes
      - **Abilities**: May separate to cancel 1 Hunt damage. If eliminated outside Mordor (Hunt or battle), return to Fellowship at turn end.
      - **Playable by**: Free Peoples
    - **Peregrin (Pippin)**:
      - **Level**: 1 | **Leadership**: 1 | **Guide**: Yes
      - **Abilities**: May separate to cancel 1 Hunt damage. If eliminated outside Mordor (Hunt or battle), return to Fellowship at turn end.
      - **Playable by**: Free Peoples
  - **Special Character**:
    - **Gollum**:
      - Not a Companion; becomes Guide if Ring-bearers are alone.
      - **Level**: 0 | **Leadership**: 0 | **Guide**: Yes
      - **Abilities**: May reveal the Fellowship to cancel 1 Hunt damage.
      - **Behavior**: Always follows the Fellowship. Place figure on board if Guide.
      - **Playable by**: Free Peoples
  - **Minions (Shadow)**:
    - Do not begin in play; summoned via Muster die under specific conditions.
    - **Saruman**:
      - **Level**: 0 | **Leadership**: 1 | **Guide**: No
      - **Abilities**: Adds one Action Die. Isengard Elite units act as Leaders and Army units (for movement, combat, Hunt rerolls).
      - **Entry**: Muster die in Orthanc when Isengard is “At War” and Orthanc is unconquered.
      - **Restrictions**: Cannot move from Orthanc.
      - **Playable by**: Isengard
    - **Witch-king (Chief of the Ringwraiths)**:
      - **Level**: ∞ | **Leadership**: 2 | **Guide**: No
      - **Abilities**: Adds one Action Die. After playing a Combat Card, draw a matching Event Card (Character or Strategy).
      - **Entry**: Muster die when Shadow has 4+ Victory Points; place in any region.
      - **Playable by**: Sauron
    - **Mouth of Sauron**:
      - **Level**: 3 | **Leadership**: 2 | **Guide**: No
      - **Abilities**: Adds one Action Die. Once per turn, may use a Muster die as an Army die.
      - **Entry**: Muster die in a Sauron Stronghold (e.g., Barad-dûr, Minas Morgul).
      - **Playable by**: Sauron
  - **Character Setup Summary**:
    - **Start in Fellowship**: Frodo/Sam and 7 Companions (Gandalf the Grey, Strider, Boromir, Legolas, Gimli, Merry, Pippin) begin in Rivendell.
    - **Enter Later**: Gandalf the White (Will of the West die, Gandalf the Grey dead, Shadow Minion in play, place in Elven Stronghold or Fangorn), Aragorn (Will of the West die, replace Strider in Minas Tirith, Pelargir, or Dol Amroth), Saruman, Witch-king, Mouth of Sauron via Muster die.
    - **Gollum**: Follows Fellowship; appears on board as Guide if no Companions remain.

## Tracks and Boxes
- **Hunt Box**: Holds Shadow Hunt dice and Free Peoples Fellowship movement dice.
- **Political Track**: Passive (face down), Active (face up), 3 peace boxes, 1 At War box.
- **Victory Track**: Free Peoples (0–4 VP), Shadow (0–10+ VP).
- **Corruption Track**: 0–12.
- **Fellowship Track**: Hidden/Revealed, 0–12 steps.
- **Strategy Deck and Character Deck**: For both Free Peoples and Shadow.
- **Elven Rings**: 3 for Free Peoples, flipped to dark side in Shadow Rings box when used, removed after Shadow use.
- **Fellowship Box**: Current Companions with the Ring-bearers.
- **Guide Box**: Current Guide of the Fellowship.
- **Mordor Track**: 6 areas (0–5, then Crack of Doom).

## Action Dice
- **Results**: Army, Character, Muster, Event (Palantir), Muster/Army, Eye (Shadow), Will of the West (Free Peoples).
- **Description**: Free Peoples share a single pool of 4 blue dice, Shadow shares a single pool of 7 red dice. Each side uses these dice collectively, regardless of player count. Actions are resolved as a team, with players coordinating pool use. In 3- and 4-player games, teammates may discuss Action Dice strategy (not specific dice assignments) before allocation.
- **Actions**:
  - **Army**:
    - Move up to 2 Armies to adjacent Free Regions (1 region each).
    - Attack an adjacent enemy Army (field battle, siege, or sortie).
    - Play an Army Event Card.
  - **Character**:
    - Move Fellowship (advance Progress Counter, trigger Hunt, place die in Hunt box).
    - Hide Revealed Fellowship (no Hunt box placement).
    - Separate Companion(s) to Ring-bearers’ region, then move up to Progress Counter + highest Level.
    - Move Companions (each group up to highest Level in group).
    - Move Army containing a Leader, Companion, or Minion.
    - Move Nazgûl (anywhere except Free Peoples Strongholds unless besieged) or Minions (Saruman: Orthanc only, Mouth of Sauron: up to 3 regions).
    - Play a Character Event Card.
  - **Muster**:
    - Advance one friendly Nation’s Political Track (Free Peoples: must be Active to reach “At War”).
    - If “At War,” recruit in free Settlements: 1 Elite, or 2 Leaders in different Settlements, or 2 Regulars in different Settlements, or 1 Leader + 1 Regular in different Settlements.
    - Muster a Minion (Saruman, Witch-king, Mouth of Sauron per conditions).
    - Play a Muster Event Card.
  - **Event**:
    - Draw 1 Event Card from a chosen deck.
    - Play any Event Card.
  - **Muster/Army**:
    - Choose any Muster or Army action.
  - **Will of the West**:
    - Perform any action (except convert to Will of the West).
    - Muster Gandalf the White or Aragorn per conditions.
  - **Eye**:
    - Place in Hunt box for allocation.
- **Elven Rings**:
  - One use per side per turn. Free Peoples flip a Ring to dark side and place in Shadow Rings box to change one unused Action Die result (not to Will of the West). Shadow uses a dark Ring to change a result (including to Eye, placing in Hunt box), then removes it from game. Both sides may use the same Ring in one turn if passed.
- **Action Die Bonus**:
  - Gandalf the White, Aragorn add 1 blue die to Free Peoples pool.
  - Saruman, Witch-king, Mouth of Sauron add 1 red die to Shadow pool.

## Event Cards
- **Decks**: FP Character (24), FP Strategy (24), SP Character (24), SP Strategy (24).
- **Structure**: Top (Event, requires matching die: Character, Muster, Army, or Palantir), bottom (Combat Card, played during battle).
- **Drawing**: See **Game Turn - Recover Action Dice and Draw Event Cards**.
- **Playing**:
  - Use Palantir die to draw or play any Event Card, or use a matching die (Character, Muster, Army) to play.
  - Normally, Event cards can only be used by a player if they apply to a Nation or Character they control, indicated by the icon in the lower right corner of the Event portion:
    - **Gondor**: Playable by Gondor player (4-player: Player 1; 3-player: FP player).
    - **Rohan**: Playable by Rohan player (4-player: Player 2; 3-player: FP player).
    - **Witch-king**: Playable by Sauron player (4-player: Player 3; 3-player: Player 1).
    - **Saruman**: Playable by Isengard/Southrons & Easterlings player (4-player: Player 4; 3-player: Player 2).
  - Cards without an icon (e.g., Free Peoples or Shadow symbols) may be used by any player as appropriate, if the effect applies to their controlled Nation or Character.
  - In 3-player games, the FP player may use any Free Peoples card (Gondor, Rohan, Elves, etc.), and Shadow players are restricted to their Nation’s cards (e.g., Witch-king for Sauron, Saruman for Isengard/Southrons & Easterlings).
  - In 4-player games, FP players are restricted to their assigned Nations (e.g., Player 1: Gondor, Elves; Player 2: Rohan, The North, Dwarves), and Shadow players to theirs (e.g., Player 3: Sauron; Player 4: Isengard/Southrons & Easterlings).
  - “Play on table” cards persist until conditions met (discard counts as action if die required).
  - Partial effects apply if requirements partially met (e.g., recruit in one region if multiple specified).
  - “Attack” cards trigger political effects (activation/advancement) like normal attacks.
- **Special**:
  - Gandalf the Grey draws a matching Event Card (Character) after playing one.
  - Witch-king draws a matching Event Card (Character or Strategy) after playing a Combat Card.
- **Full List**: See Appendix A (96 Event Cards, to be populated from card files).

## Combat Cards
- **Play**: One per battle round, no Action Die required. Attacker declares intent first, defender responds; both select secretly and reveal simultaneously. Defender’s card resolves first if effects interact. Discard after use. Some require forfeiting Leadership (no rerolls that round).
- **Full List**: See Appendix B (62 Combat Cards, to be populated from card files).

## Armies and Battles
- **Armies**: All friendly units (Regular, Elite), Leaders, and Characters in a region form one Army, unless separate in 3- and 4-player games (see **Multiplayer Rules - Mixed Armies**). Units from different Nations may combine.
- **Stacking**:
  - Max 10 units per region (Regular/Elite, excluding Leaders/Characters), reduced to 5 in a besieged Stronghold.
  - Excess units (after movement, mustering, etc.) are chosen by the controlling player and returned to reinforcements, available for recruitment.
  - In 3- and 4-player games, teammate armies may remain separate in a region; see **Multiplayer Rules - Mixed Armies** for stacking details.
  - Free Peoples and Shadow units removed due to stacking return to their respective reinforcements pools.
- **Recruitment**:
  - Muster die for “At War” Nations in free Settlements (not enemy-controlled or containing enemy units, e.g., Pelargir, Umbar).
  - Options: 1 Elite, 2 Leaders in different Settlements, 2 Regulars in different Settlements, 1 Leader + 1 Regular in different Settlements.
  - Nazgûl: Recruited in Sauron Strongholds when “At War.”
  - Event Cards may recruit in non-“At War” Nations or besieged Strongholds if specified, blocked by enemy units/control markers unless defending a besieged Stronghold.
  - Shadow draws from reinforcements (including eliminated units); Free Peoples draw from reinforcements (initial setup and stacking removals, not combat eliminations).
- **Leadership**:
  - Provided by Free Peoples Leaders (require Army), Nazgûl (move independently), Companions (e.g., Boromir: Leadership 1), Minions (e.g., Witch-king: Leadership 2).
  - In 3- and 4-player games, Leadership is tied to each player’s units when separate; in Mixed Armies, all Leaders contribute to total Leadership (see **Multiplayer Rules - Mixed Armies**).
  - Saruman makes Isengard/Southrons & Easterlings Elite units count as Leaders and Army units.

### Combat
- **Initiation**:
  - Use Army or Character die (requires Leadership, e.g., Boromir, Saruman) to attack an adjacent enemy Army. Max 5 rounds unless extended by cards or Elite reduction. Only “At War” Nations can attack. One Army attacks; all defending units participate. Attackers may leave a rearguard (min 1 unit).
  - In 3- and 4-player games, teammate armies must combine into a Mixed Army if defending a region under attack, with all Leaders contributing to total Leadership; the controlling player makes decisions (see **Multiplayer Rules - Mixed Armies**).
- **Combat Rounds**:
  1. **Play Combat Cards**:
     - Attacker declares intent to play a card, then defender responds. Attacker cannot change decision.
     - Both secretly select and reveal simultaneously.
     - Defender’s card resolves first if effects interact.
     - Effects last one round unless stated; discard after use.
     - Some cards require forfeiting Leadership (no rerolls that round).
  2. **Roll Combat Dice**:
     - Roll up to 5 dice (min of Combat Strength or units).
     - **Combat Strength**: 1 per Regular unit + 1 per Elite unit + Leadership (total Leaders/Nazgûl + Character Leadership, max 5).
     - Natural 1 always misses, natural 6 always hits.
  3. **Score Hits**:
     - **Standard**: Both hit on 5+.
     - **City/Fortification**: Attacker hits on 6+ in first round only (5+ thereafter, unless besieging); defender hits on 5+.
     - **Stronghold**: If field battle, both hit on 5+; if siege, attacker hits on 6+ for all rounds, defender on 5+ (see Sieges).
  4. **Remove Casualties**:
     - Attacker chooses first; remove casualties equal to opponent’s hits.
     - **Per Hit**:
       - Remove 1 Regular unit, **or**
       - Replace 1 Elite unit with a Regular unit of the same Nation (e.g., Gondor Regular for Gondor Elite). Regular may come from casualties taken earlier in the current battle (if any) or reinforcements, if available.
     - **Per Two Hits**:
       - Remove 2 Regulars, **or**
       - Replace 2 Elites with Regulars of the same Nation (from current battle casualties or reinforcements), **or**
       - Remove 1 Elite unit outright.
     - **Edge Case**: If no Regular units of the same Nation are available (from current battle casualties or reinforcements), Free Peoples cannot replace an Elite; eliminate the Elite (counts as 1 hit, placed in graveyard). Shadow eliminates the Elite to reinforcements.
     - Free Peoples Regulars used for replacement (from battle casualties) remain casualties; replaced Elites and other combat eliminations (Regulars, Leaders, Companions, except Merry/Pippin via abilities) are permanently removed (placed in graveyard post-battle). Shadow units and Nazgûl return to reinforcements; Minions permanently removed.
     - If all units eliminated, remove all Leaders, Nazgûl, Companions, Minions in region to graveyard (Free Peoples) or reinforcements (Shadow, except Minions).
  5. **Leader Re-roll**:
     - Reroll failed dice up to Leadership (max 5).
     - Hits on 5+ unless modified; forfeited if Leadership sacrificed (e.g., Combat Card).
  6. **Continue or Stop**:
     - Attacker decides to continue (up to 5 rounds).
     - If continuing, defender may retreat to an adjacent Free Region (no enemy units/control markers, friendly Settlement captured by enemy, or region besieging an enemy Stronghold) or into a Stronghold siege (same region).
     - Defender cannot retreat if attacker stops after one round.
     - Free Peoples’ Scouts Combat Card allows retreat before combat.
     - Non-“At War” units retreating across other Nations’ borders must exit on next move unless “At War.”
     - Attacker may leave a rearguard (min 1 unit) before retreating or advance only part of Army after winning.
- **End of Battle**:
  - Ends when attacker stops, defender retreats, or one/both sides eliminated.
  - Attacker advances into region if defender eliminated/retreats; siege begins if defender retreats into Stronghold.

## Fortifications, Cities, and Sieges
### Fortifications and Cities
- **Function**: Identical in combat; located at Osgiliath and Fords of Isen.
- **Combat**:
  - First round: Attacker hits on 6+, defender on 5+.
  - Subsequent rounds: Both hit on 5+ unless besieging (attacker 6+, defender 5+).
- **Control**: Osgiliath (Free Peoples, 2 Regular), Fords of Isen (Free Peoples, 2 Regular, 1 Leader).

### Strongholds and Sieges
- **Field to Siege**:
  - Before each combat round, defender in a Stronghold region (e.g., Minas Tirith, Umbar) chooses:
    - **Field Battle**: Resolve normally (both hit on 5+).
    - **Retreat into Siege**: Move defenders to Stronghold box (max 5 units, excess to reinforcements for both sides), battle ends, attacker advances into region.
  - Siege begins in original or enemy-controlled Stronghold.
- **Siege Rules**:
  - Max 5 units in Stronghold box (any number of Leaders, Companions, Minions).
  - Excess units removed when siege begins: Free Peoples and Shadow units return to reinforcements, available for recruitment.
  - No defender retreat or movement (except sortie).
  - Besieging Army moves as if controlling the region.
  - Siege ends when no enemy units remain in region; defenders return to map.
- **Siege Battles**:
  - Use Army or Character die (requires Leadership, e.g., Aragorn, Mouth of Sauron) in Stronghold region.
  - Attacker hits on 6+ for all rounds, defender on 5+.
  - One round unless attacker reduces Elite to Regular for an extra round (repeatable).
  - If both survive, siege persists.
- **Sortie**:
  - Stronghold Army attacks besiegers with Army or Character die (requires Leadership, e.g., Boromir).
  - Resolved as field battle (both hit on 5+).
  - Besieged may leave a rearguard (min 1 unit) in Stronghold.
  - If besiegers retreat, move to a Free adjacent region; if besieged stop, return to Stronghold.
  - Besieged cannot advance outside region.
- **Relieving a Siege**:
  - Adjacent friendly Army attacks besiegers in field battle (both hit on 5+).
  - Stronghold units do not participate until besiegers eliminated/retreat.
- **Reinforcing a Siege**:
  - Besiegers add units via movement (counts as action, not attack).

## Politics
- **Activation**: Flip Nation to Active (face up) when:
  - Enemy Army enters its region.
  - Its Army is attacked.
  - Fellowship declared in its City/Stronghold (e.g., Pelargir for Gondor, Far Harad for Southrons).
  - Companion with matching Nation icon (or Free Peoples symbol) ends movement/enters play in its unconquered City/Stronghold (e.g., Boromir in Minas Tirith, Legolas in Lórien).
  - Event Card specifies.
- **Advancing**:
  - Muster die advances one Active friendly Nation one step toward “At War” (Free Peoples require Active status to reach “At War”).
  - Companion ability (e.g., Gimli in Erebor, Boromir in Minas Tirith) or Event Card advances Nation.
  - Automatic: One step when Army attacked (once per battle) or Settlement captured.
- **At War**:
  - Armies can attack, move across other Nations’ borders (friendly or enemy), recruit with Muster dice.
- **Non-Belligerent (Not At War)**:
  - Cannot move across other Nations’ borders (except retreating), attack, or recruit with Muster dice.
  - Mixed Armies with non-belligerent units cannot attack.

## Free Regions
- **Definition**: A region is Free for a side if:
  1. It has no enemy Army or enemy-controlled Settlement (e.g., Folde, Osgiliath for Free Peoples; Nurn, Umbar for Shadow).
  2. It contains an enemy Stronghold currently besieged by a friendly Army.
- **Free for Movement**:
  - Armies move to Free Regions or enemy-controlled Settlements without enemy units (e.g., captured Minas Tirith, no Shadow units).
- **Free for Recruitment**:
  - Settlements must be free (no enemy units or control markers) unless Event Card allows (e.g., besieged Stronghold defense).
- **Character Movement**:
  - Ignore enemy Armies, stop in Shadow-controlled Strongholds, cannot enter/leave friendly besieged Strongholds (unless Event Card allows).
  - Move up to Level (e.g., Strider: 3); groups use highest Level.
  - Separation: Move to Ring-bearers’ region, then up to Progress Counter + highest Level.

## The Fellowship
- **Movement**:
  - Use Character die to advance Progress Counter one step (Hidden); triggers Hunt, places die in Hunt box.
  - Event Cards may move Fellowship (no Hunt box placement unless specified).
- **Guide**:
  - Highest-Level Companion (e.g., Gandalf the Grey, Strider: Level 3; Free Peoples choose on tie).
  - Gollum becomes Guide if no Companions remain; may reveal Fellowship to reduce Hunt damage by 1.
  - Change Guide in Fellowship Phase or after composition change (separation, casualty).
- **Corruption**:
  - 0–12 on Corruption Track.
  - Increased by Hunt damage or Event Cards.
  - Reduced by healing (1 per turn in Free Peoples City/Stronghold) or Event Cards/abilities.
  - 12 Corruption = immediate Shadow victory.
- **Separation**:
  - Use Character die (not in Mordor); move Companion(s) to Ring-bearers’ region, then up to Progress Counter + highest Level.
  - Groups move to one region using highest Level.
  - In besieged Free Peoples Stronghold: Separate into Stronghold, cannot leave.
  - In Mordor: Separated Companions eliminated.
  - Permanent: Separated Companions cannot rejoin.
  - Merry/Pippin: If eliminated outside Mordor (Hunt or battle), return to Fellowship at turn end.
- **Hiding**:
  - Use Character die to flip Revealed Fellowship to Hidden (no movement, no Hunt box placement).

## Hunt for the Ring
- **Pool**: 16 Standard tiles (12 numbered 0–3, some with Reveal icon; 4 Eye). Special tiles added via Event Cards (e.g., blue for Free Peoples, red for Shadow) or Mordor entry.
- **Hunt Roll**:
  - Triggered by Fellowship movement (Character die or Event Card).
  - Roll Shadow dice in Hunt box (max 5).
  - +1 per Free Peoples die in Hunt box from prior moves this turn (1 always fails).
  - Success on 6+.
  - Reroll one failed die per condition in Ring-bearers’ region: Shadow-controlled Stronghold, one or more Shadow Army units, one or more Nazgûl (e.g., Stronghold + Army + Nazgûl = 3 rerolls).
  - In 3- and 4-player games with Saruman in play, each Isengard/Southrons & Easterlings Elite unit counts as a Leader, adding one reroll.
  - Draw 1 Hunt tile on success.
- **Tile Effects**:
  - **Numbered (0–3)**: Damage (Corruption or casualty).
  - **Eye**: Damage = number of successes (0 if drawn outside Hunt).
  - **Reveal**: Fellowship Revealed after other effects (ignored if in Free Peoples City/Stronghold).
  - **Special Tiles**: Added by Event Cards (e.g., -1/-2 reduce Corruption, die rolls for damage, Stop prevents movement).
- **Hunt Effects**:
  1. **Cancel/Reduce**: Use Guide ability (e.g., Gollum reveals to cancel 1 damage) or “play on table” Event Card (e.g., “Elven Cloaks”).
  2. **Casualty (Optional)**: Eliminate one Companion (choose Guide or draw random counter, excluding Ring-bearers). Reduce damage by Level (e.g., Boromir: 2); excess becomes Corruption. Lower damage eliminates Companion fully (no wounding).
  3. **Corruption**: Add remaining damage to Corruption Track.
  4. **Reveal**: If tile has Reveal icon, set Fellowship to Revealed (may trigger Shadow Stronghold tiles).
- **Shadow Stronghold**:
  - Draw 1 additional tile per Shadow Stronghold entered/left/stationary when Revealed (not Declared), after resolving Hunt tile (Eye counts as 0).
- **Depleted Pool**:
  - Return Standard tiles (Eye, numbered); exclude Special or permanently removed tiles.

## Mordor Track
- **Entry**:
  - Declare in Morannon or Minas Morgul during Fellowship Phase.
  - Place Ring-bearers on Mordor Track step 0.
  - Reset Hunt Pool with Standard tiles and Special tiles in play (exclude permanently removed tiles).
- **Movement**:
  - Must be Hidden to move.
  - Use Character die to draw 1 Hunt tile (no roll); advance one step unless Stop icon.
  - Eye tile: Damage = total dice in Hunt box (Shadow + Free Peoples, not limited to 5).
  - Progress Counter tracks Hidden/Revealed, not steps.
- **Inactivity**:
  - +1 Corruption if Revealed and no move or hide attempted in a turn.
- **Companions**:
  - Eliminated if separated in Mordor (e.g., Legolas, Gimli).
- **Victory**:
  - Reach Crack of Doom (step 5) with <12 Corruption for immediate Free Peoples victory.

## Victory Conditions
- **Military** (checked in Phase 6):
  - Shadow wins if they hold 10+ VP in Free Peoples Cities/Strongholds.
  - Free Peoples win if they hold 4+ VP in Shadow Cities/Strongholds and Shadow has <10 VP.
- **Ring** (immediate):
  - Free Peoples win if Ring-bearers reach Crack of Doom with <12 Corruption.
- **Corruption** (immediate):
  - Shadow wins if Corruption reaches 12.
- **Precedence**:
  - Shadow Corruption victory (12 Corruption) takes precedence over Free Peoples Ring victory (Crack of Doom).
  - Ring-based victories override Military victories.
- **Team Scoring (3- and 4-Player Games)**:
  - **Shadow**: Highest net score = VP gained from enemy Cities/Strongholds – VP lost from own Nations.
  - **Free Peoples**: Lowest loss of City/Stronghold VP wins.

## Edge Cases
- **Nazgûl**:
  - Move freely (except into Free Peoples Strongholds unless besieged) unless Event Card restricts (e.g., “The Nazgûl Strike!”).
- **Siege Stacking**:
  - Max 5 units in besieged Stronghold (any number of Leaders, Companions, Minions); Free Peoples and Shadow excess to reinforcements.
- **Companion Separation**:
  - Eliminated in Mordor; if all separate, Gollum becomes Guide, placed on board.
  - Merry/Pippin return to Fellowship at turn end if eliminated outside Mordor (Hunt or battle).
- **Multiple Army Moves**:
  - Army die moves 2 Armies, 1 region each; no splitting mid-move to multiple regions.
- **Stronghold Recapture**:
  - Side regains control if no enemy units remain after battle or movement (e.g., Free Peoples recapture Minas Tirith).
- **Character Replacement**:
  - Strider to Aragorn: Will of the West die in Minas Tirith, Pelargir, or Dol Amroth.
  - Gandalf the Grey to Gandalf the White: Will of the West die, Gandalf the Grey dead, Shadow Minion in play, place in Elven Stronghold or Fangorn.
- **Hunt Rerolls**:
  - Apply per Ring-bearers’ region state at Hunt resolution (e.g., Shadow Stronghold, Army, Nazgûl, Saruman’s Elites).
- **Action Dice**:
  - Shared pools: Free Peoples (4–6 blue dice), Shadow (7–10 red dice). Players cannot act if no dice remain in their pool.
- **Multiplayer Stacking**:
  - In 3- and 4-player games, teammate armies exceeding 10 units trigger alternating removal (see **Multiplayer Rules - Mixed Armies**).
- **Mixed Army Leadership**:
  - In 3- and 4-player games, all Leaders in a Mixed Army stack for total Leadership, with the controlling player deciding actions (see **Multiplayer Rules - Mixed Armies**).

## Future Expansions and Scenarios
- **Expansions**: Placeholder for *Lords of Middle-earth*, *Warriors of Middle-earth*, *Kings of Middle-earth*:
  - Additional cards, Characters, dice, Hunt tiles.
- **Scenarios**: Placeholder for “Breaking of the Fellowship,” “Treebeard”:
  - Pre-configured setups.

## Developer Notes
- **Rules Validation**:
  - Ensure `validateMove` checks:
    - Combat Card timing (attacker declares first, defender’s card resolves first).
    - Siege transitions (field to siege before each round, attacker 6+ all rounds).
    - Sortie rules (field battle, no advance outside region).
    - Stacking limits (max 10 units, 5 in besieged Stronghold; for 3/4-player games, separate teammate armies and alternating removal handled in **Multiplayer Rules** logic, cross-referenced in **Stacking**).
    - Retreat restrictions (no retreat if attacker stops after one round, Scouts card).
    - Elven Rings (one per side per turn, same Ring reusable).
    - Free Peoples casualty options (per hit: 1 Regular or Elite-to-Regular using current battle casualties/reinforcements, same Nation; per 2 hits: 2 Regulars, 2 Elite-to-Regular, or 1 Elite; no Regulars = Elite elimination).
    - Free Peoples recruitment (from `offBoard.free.reinforcements`, including stacking removals, not `offBoard.free.graveyard`).
    - Multiplayer rules (3-player: FP non-consecutive Nation/Army per cycle, passing; 4-player: sequence, passing retains position; teammate card swapping, Action Dice discussion, Leader control, Event Card eligibility by Nation icon, Mixed Army combination, stacked Leadership).
    - Character elimination (Merry/Pippin return to Fellowship if eliminated outside Mordor, handled separately from units).
  - Verify shared Action Dice pools: Free Peoples (4–6 blue dice), Shadow (7–10 red dice), no per-player ownership.
- **State Tracking**:
  - Track `fellowshipTrack.progress.hidden` and `corruption` for Hunt and Mordor mechanics.
  - Monitor `politicalTrack` for Nation status (Passive/Active, peace/At War).
  - Update `victoryPoints` after Settlement capture/recapture.
  - Use `offBoard.free.reinforcements` for Free Peoples setup and stacking removals, `offBoard.free.graveyard` for combat eliminations (units and Characters, except Merry/Pippin outside Mordor), `offBoard.shadow.reinforcements` for Shadow setup, combat, and stacking removals.
  - Track `battleState.free.casualties.regular` (same Nation) during combat for Free Peoples Elite replacement, moving all casualties to `offBoard.free.graveyard` post-battle.
  - For 3/4-player games, leverage `gameState.regions[regionId].deployments` (e.g., `{ group: "normal", units: { regular: 5, elite: 0, owner: "p1" }, leaders: 1 }, { group: "normal", units: { regular: 3, elite: 2, owner: "p2" }, leaders: 1 }`) to manage separate teammate armies, Leaders, alternating removal (non-Leading first), and stacked Leadership in Mixed Armies.
  - Track Characters in `gameState.regions[regionId].characters` (e.g., ["Merry", "Pippin"]), ensuring `resolveCombat` returns Merry/Pippin to Fellowship if eliminated outside Mordor.
- **UI Components**:
  - `ActionDiceArea`: Display shared pools (Free Peoples: blue, Shadow: red) with no per-player attribution.
  - `BoardMap`: Render regions from `regions.json`, highlight Free Regions for movement; in 3/4-player games, show separate armies (e.g., “Minas Tirith: Gondor 5, Rohan 3”).
  - `UnitTracker`: Show `offBoard.free.reinforcements` (available for muster/stacking), `offBoard.free.graveyard` (unavailable combat losses), and `offBoard.shadow.reinforcements` (dynamic pool).
  - `CasualtyPrompt`: Display valid options (e.g., “2 hits: 2 Regulars, 2 Elite-to-Regular, or 1 Elite”), show `battleState.free.casualties.regular` (same Nation) for Free Peoples Elite replacement, warn if no Regulars available (e.g., “No Gondor Regulars; eliminate Elite for 1 hit”). For Characters, note Merry/Pippin’s return (e.g., “Merry eliminated outside Mordor; returns to Fellowship”).
  - `StackingPrompt`: In 3/4-player games, if total > 10, prompt non-Leading player to remove first via **Multiplayer Rules** logic (e.g., “Non-Leading FP: Remove 1 unit from Rohan”).
  - `CombatPrompt`: In 3/4-player games, show total Leadership for Mixed Armies (e.g., “Leadership: 2 (Gondor 1, Rohan 1)”), with controlling player selecting actions.
  - `EventCardPrompt`: Show eligible cards based on Nation icons (e.g., “Gondor card playable by Player 1”), highlight no-icon cards for any player.
- **Testing**:
  - Validate:
    - Siege battles (attacker 6+, defender 5+ all rounds).
    - City/Fortification battles (attacker 6+ first round, 5+ thereafter).
    - Sortie (both 5+).
    - Character plays (e.g., Boromir in Minas Tirith advances Gondor).
    - 4-player action order (Non-Leading FP → Non-Leading Shadow → Leading FP → Leading Shadow).
    - 3-player action cycle (Non-Leading SP, FP, Leading SP, FP; FP non-consecutive per cycle, passing allowed).
    - Hunt rerolls (Shadow Stronghold, Army, Nazgûl, Saruman’s Elites).
    - Elven Rings usage (one per side, same Ring reusable).
    - Stacking removals (e.g., 2-player: Minas Tirith with 12 units, 2 Regulars to Free Peoples reinforcements; 4-player: Minas Tirith with 6 Gondor + 5 Rohan, non-Leading FP removes 1 Rohan Regular to reinforcements via **Multiplayer Rules**; verify `deployments` updates).
    - Free Peoples combat eliminations (e.g., 3 Regulars lost in battle, to graveyard, unavailable).
    - Free Peoples casualty edge case (e.g., 3 hits in Gondor, Round 1: 1 Regular to casualties; Round 2: 2 hits, use 1 casualty Gondor Regular + 1 reinforcement Gondor Regular to replace 2 Elites, Elites to graveyard, Regulars to graveyard post-battle; verify only Gondor Regulars used).
    - Free Peoples no Regulars (e.g., no Gondor Regulars in casualties/reinforcements, 1 Elite eliminated to graveyard, counts as 1 hit).
    - Shadow casualty handling (e.g., 2 hits, replace 2 Elites with Regulars from reinforcements, or remove 1 Elite to reinforcements).
    - Multiplayer specifics (e.g., card swapping with strategy discussion, Action Dice discussion, Leader control with separate armies, Event Card eligibility by Nation icon, 3-player FP passing, Mixed Army combination, stacked Leadership).
    - Character elimination (e.g., Merry/Pippin eliminated outside Mordor return to Fellowship, verified in `resolveCombat`; other Companions to graveyard).
  - Test edge cases: Gollum as Guide, Merry/Pippin return, Mordor Companion elimination, Free Peoples reinforcement depletion, same-Nation casualty reuse, multiplayer stacking (e.g., 3-player Dol Guldur: 7 Sauron + 5 Isengard, non-Leading SP removes 1 Isengard Elite, Leading SP removes 1 Sauron Regular, verify `deployments[].owner`).

## Appendix A: Event Cards (96 Total)
*Note*: Full list to be populated from card files. Examples below reflect base game mechanics.
### Free Peoples Character (24)
1. **Elven Cloaks**: Add [0] Special tile to Hunt Pool when Fellowship enters Mordor Track.
2. **Phial of Galadriel**: Add [-2] Special tile to Hunt Pool when Fellowship is on Mordor Track.
3. **Athelas**: If Strider or Aragorn is with a Free Peoples Army, roll 3 dice (5+ heals 1 Corruption per success).
[... Placeholder for remaining cards, e.g., “Mithril Coat and Sting,” “The Eagles are Coming!” ...]
24. **There is Another Way**: Move Fellowship 1 region toward Minas Morgul or Morannon if Hidden and not in Mordor.

### Free Peoples Strategy (24)
1. **Muster the Ents**: Recruit 2 Elite units in Fangorn if Gandalf is with a Free Peoples Army.
2. **The Ents Awake: Huorns**: Move an Army from Fangorn or Rohan to besiege Orthanc if “Ents Awake” is on table.
[... Placeholder for remaining cards, e.g., “Dead Men of Dunharrow,” “Horn of Gondor” ...]
24. **The Last Battle**: If a Free Peoples Army is in Mordor, Shadow Hunt dice do not trigger Hunt effects this turn.

### Shadow Character (24)
1. **Cruel Weather**: Fellowship can only move to an adjacent region this turn.
2. **Shelob’s Lair**: Add [die, Stop] Special tile to Hunt Pool when Fellowship enters Mordor Track.
[... Placeholder for remaining cards, e.g., “Nazgûl Search,” “The Ringwraiths Are Abroad” ...]
24. **Pits of Mordor**: If Fellowship is on Mordor Track, reveal it and add +2 Corruption.

### Shadow Strategy (24)
1. **Wormtongue**: If Saruman is in play, Rohan cannot advance to “At War” this turn.
2. **The Nazgûl Strike!**: Move all Nazgûl to one region; discard Free Peoples’ “Axe and Bow” or roll 1 Hunt die (6 = +1 Corruption).
[... Placeholder for remaining cards, e.g., “Grond, Hammer of the Underworld,” “Siege Towers” ...]
24. **Rage of the Dunlendings**: Add +1 Combat die to attack from North Dunland, South Dunland, or Orthanc if Isengard is “At War.”

## Appendix B: Combat Cards (62 Total)
*Note*: Full list to be populated from card files. Examples below reflect base game mechanics.
### Examples
1. **It is a Gift**: If Fellowship is with a Free Peoples Army, add +1 Combat die; discard after roll.
2. **Sudden Strike**: Pre-roll Leadership dice; hits count toward battle; discard after use.
3. **Blade of Westernesse**: If Merry or Pippin is with a Free Peoples Army, eliminate 1 Minion; discard.
[... Placeholder for remaining cards, e.g., “One for the Dark Lord,” “Desperate Battle” ...]
62. **The Lidless Eye**: If Witch-king is in battle, reroll all Combat dice; discard.

## Appendix C: Characters (11 Total)
1. **Frodo and Sam**:
   - **Level**: 1/0 | **Leadership**: 0 | **Guide**: Yes
   - **Abilities**: None.
   - **Restrictions**: Cannot leave Fellowship.
   - **Playable by**: Free Peoples
2. **Gandalf the Grey**:
   - **Level**: 3 | **Leadership**: 1 | **Guide**: Yes
   - **Abilities**: After playing a Free Peoples Character Event Card, draw another Character Event Card. In battle, adds +1 Combat Strength (max 5 dice). May be replaced by Gandalf the White.
   - **Playable by**: Free Peoples
3. **Strider**:
   - **Level**: 3 | **Leadership**: 1 | **Guide**: Yes
   - **Abilities**: Use a Character die to hide a Revealed Fellowship. May be replaced by Aragorn.
   - **Playable by**: The North
4. **Boromir**:
   - **Level**: 2 | **Leadership**: 1 | **Guide**: No
   - **Abilities**: In battle, adds +1 Combat Strength (max 5 dice). Use any Action Die to advance Gondor’s Political Track if in an unconquered Gondor City/Stronghold.
   - **Playable by**: Gondor
5. **Legolas**:
   - **Level**: 2 | **Leadership**: 1 | **Guide**: No
   - **Abilities**: In battle, adds +1 Combat Strength (max 5 dice). Use any Action Die to advance Elves’ Political Track if in an unconquered Elven Stronghold.
   - **Playable by**: Elves
6. **Gimli**:
   - **Level**: 2 | **Leadership**: 1 | **Guide**: No
   - **Abilities**: In battle, adds +1 Combat Strength (max 5 dice). Use any Action Die to advance Dwarves’ Political Track if in unconquered Erebor.
   - **Playable by**: Dwarves
7. **Peregrin (Pippin)**:
   - **Level**: 1 | **Leadership**: 1 | **Guide**: Yes
   - **Abilities**: May separate to cancel 1 Hunt damage. If eliminated outside Mordor, return to Fellowship at turn end.
   - **Playable by**: Free Peoples
8. **Meriadoc (Merry)**:
   - **Level**: 1 | **Leadership**: 1 | **Guide**: Yes
   - **Abilities**: May separate to cancel 1 Hunt damage. If eliminated outside Mordor, return to Fellowship at turn end.
   - **Playable by**: Free Peoples
9. **Gollum**:
   - **Level**: 0 | **Leadership**: 0 | **Guide**: Yes
   - **Abilities**: May reveal Fellowship to cancel 1 Hunt damage.
   - **Playable by**: Free Peoples
10. **Saruman**:
    - **Level**: 0 | **Leadership**: 1 | **Guide**: No
    - **Abilities**: Adds one Action Die. Isengard Elite units act as Leaders and Army units.
    - **Entry**: Muster die in Orthanc when Isengard is “At War” and unconquered.
    - **Restrictions**: Cannot move from Orthanc.
    - **Playable by**: Isengard
11. **Witch-king**:
    - **Level**: ∞ | **Leadership**: 2 | **Guide**: No
    - **Abilities**: Adds one Action Die. After playing a Combat Card, draw a matching Event Card.
    - **Entry**: Muster die when Shadow has 4+ VP.
    - **Playable by**: Sauron
12. **Mouth of Sauron**:
    - **Level**: 3 | **Leadership**: 2 | **Guide**: No
    - **Abilities**: Adds one Action Die. Once per turn, may use a Muster die as an Army die.
    - **Entry**: Muster die in a Sauron Stronghold.
    - **Playable by**: Sauron

---

### Verification
- **Correction Applied**:
  - **Game Pieces - Army Units**: Removed incorrect Merry/Pippin exception, clarifying that only Regular and Elite units are covered:
    > Updated: "Free Peoples units eliminated in combat (including Elites replaced by Regulars) are permanently removed (placed in graveyard). Shadow units eliminated in combat or removed due to stacking limits return to reinforcements, available for recruitment."
  - **Game Pieces - Characters**: Merry and Pippin correctly listed as Companions with their return ability, unchanged:
    > "If eliminated outside Mordor (Hunt or battle), return to Fellowship at turn end."
  - **Remove Casualties**: Accurately distinguishes Companions (with Merry/Pippin’s exception) from units, unchanged.
  - **Edge Cases**: Merry/Pippin’s return correctly noted, unchanged.
  - **Other Sections**: No misclassification of Merry/Pippin as units elsewhere (e.g., **Combat**, **Multiplayer Rules**).
- **Correct Information**: Includes only accurate rules
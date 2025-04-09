# War of the Ring Rules Guide v1.3 (Base Game Edition)

*Note*: Version 1.3 integrates detailed combat rules from "Resolving a Battle," focusing on the base game with hooks for expansions/scenarios. Aligned with PRD v1.3, Implementation Guide v1.3, and TODO List v1.3.

## Setting Up the Game
- **Players**: 2-4 players (2: Free Peoples [FP] vs. Shadow [SP]; 3-4: teams split—FP: Gondor, Rohan; SP: Witch-king, Saruman).
- **Map**: Place the Middle-earth board on a flat surface.
- **Fellowship**:
  - Place the Fellowship figure in Rivendell.
  - Set Fellowship Progress Counter on Step 0 (Fellowship Track), hidden (blue) side up.
  - Place Corruption Counter on Step 0 (Corruption Track).
  - Place 7 Companions (Frodo, Sam, Gandalf the Grey, Strider, Legolas, Gimli, Boromir, Merry, Pippin) in the Fellowship box.
  - Set Gandalf the Grey as Guide (card in Guide box).
- **Elven Rings**: Place 3 counters (ring side up) in the FP Elven Rings box.
- **Cards**: Separate unmustered Minion/Character cards; shuffle 4 Event decks (FP Character, FP Strategy, SP Character, SP Strategy) and place on board.
- **Hunt Tiles**: Place 16 standard tiles (12 numbered 0-3, 4 Eye) in an opaque Hunt Pool. *Note*: Special tiles added via expansions.
- **Action Dice**: SP gets 7 red dice; FP gets 4 blue dice.
- **Political Track**:
  - SP nations (Sauron, Isengard, Southrons & Easterlings) start face up (active).
  - FP nations (Elves, Gondor, Rohan, Dwarves, North) start face down (passive), except Elves (face up, active).
- **Army Setup**:
  - **FP**: Gondor (2 Regulars in Minas Tirith, 1 in Dol Amroth, 1 in Pelargir), Rohan (1 Regular in Edoras), Elves (1 Elite in Rivendell, 1 in Lórien, 1 in Woodland Realm), Dwarves (1 Regular in Erebor), North (1 Regular in Shire).
  - **SP**: Sauron (5 Regulars in Dol Guldur, 3 in Moria, 2 in Morannon), Isengard (3 Regulars in Orthanc), Southrons & Easterlings (2 Regulars in Umbar).

## Game Turn
1. **Draw Event Cards**: Each player draws 1 Character and 1 Strategy card.
2. **Fellowship Phase**:
   - Declare position (if hidden): Move figure up to Progress Counter regions, reset Counter to 0 (hidden), heal 1 Corruption if in FP City/Stronghold (not enemy-controlled), activate that nation.
   - Change Guide if composition changes or at turn end (highest Level; FP chooses on tie).
3. **Hunt Allocation**: SP allocates 0 to N dice (N = Companions in Fellowship, min 1 for Gollum) to Hunt box, Eye side up.
4. **Action Roll**: Roll remaining dice; add rolled Eyes to Hunt box.
5. **Action Resolution**: Alternate actions (FP first):
   - Use 1 die for an action (see Action Dice).
   - Place used Fellowship movement dice in Hunt box; others aside.
   - Pass if fewer dice than opponent.
   - If one side exhausts dice, the other uses remaining dice sequentially.
6. **Military Victory Check**: SP wins with 10+ VP at turn end; FP wins with 4+ VP if SP <10.

## Game Board
- **Regions**: Named, adjacent for movement unless separated by seas or black lines (impassable).
- **Settlements**: Empty, Fort, Town, City, Stronghold.

## Game Pieces
- **Army Units**: Regular (1 strength), Elite (2 strength).
- **Leaders**: FP (require army), Nazgûl (SP, can move alone).
- **Characters**:
  - **Companions (FP)**: Frodo/Sam (1/0), Gandalf the Grey (3/2), Strider (3/2), Legolas (2/1), Gimli (2/1), Boromir (2/1), Merry/Pippin (1/0).
  - **Minions (SP)**: Saruman (3/2), Witch-king (3/3), Mouth of Sauron (2/2) (start out of play).

## Tracks and Boxes
- **Hunt Box**: Holds Hunt dice and Fellowship movement dice.
- **Political Track**: Passive (face down), Active (face up), At War (final box).
- **Victory Track**: FP (0-4 VP), SP (0-10+ VP).
- **Corruption Track**: 0-12.
- **Fellowship Track**: Hidden/Revealed, 0-12 steps.
- **Stronghold Boxes**: Track besieged armies (siegeStatus: in/out).

## Action Dice
- **Results**: Army, Character, Muster, Event (Palantir), Eye (SP), Will of the West (FP).
- **Actions**:
  - **Army**: Move 2 armies (1 region each) or attack.
  - **Character**: Move Fellowship, separate Companions, move army with leader/character, hide Fellowship, move Nazgûl/Minions.
  - **Muster**: Recruit (2 Regulars, 2 Leaders, 1 Regular + 1 Leader, 1 Elite) or advance nation on Political Track.
  - **Event**: Play/draw Event card.
  - **Will of the West**: Muster Gandalf the White (if dead, SP Minion in play; place in Elven Stronghold or Fangorn), crown Aragorn (Strider in Minas Tirith, Pelargir, or Dol Amroth), or any other action.
  - **Eye**: Hunt allocation.
- **Elven Rings**: 1 use per side per turn; change 1 die result (not to Will of the West); SP uses once then discards.

## Event Cards
- **Decks**: FP Character (24), FP Strategy (24), SP Character (24), SP Strategy (24).
- **Structure**: Top (Event), bottom (Combat Card).
- **Drawing**: 1 each deck per turn; Palantir die draws extra; discard to 6 at turn end.
- **Playing**: Use Palantir or matching die (Character, Muster, Army); “Play on table” persists until exit conditions met.
- **Full List**: See Appendix A (96 event cards).

## Combat Cards
- **Play**: 1 per round; attacker declares first, defender responds; reveal simultaneously; discard after use. Some require Leadership forfeiture (tracked in `cards.leadershipForfeited`).
- **Full List**: See Appendix B (62 combat cards).

## Armies and Battles
- **Armies**: Friendly units in a region.
- **Stacking**: 10 units max (5 in besieged Stronghold); excess to reinforcements.
- **Recruitment**: Muster die for “At War” nations in Settlements (not enemy-controlled).
- **Minions**: Saruman (Orthanc, Isengard active), Witch-king (SP 4+ VP), Mouth (Sauron Stronghold).

### Combat
- **Initiation**: Army/Character die (if Leadership present); max 5 rounds unless extended by cards or Elite reduction.
- **Combat Rounds**:
  1. **Play Combat Cards**: 
     - Attacker declares first if playing a card, then defender responds.
     - Both secretly select and reveal simultaneously.
     - Apply defender’s card first if both played; effects last one round unless stated.
     - Some cards require forfeiting Leadership (Leadership not counted for rerolls this round; track in state).
  2. **Roll Combat Dice**: Up to 5 units roll dice (Combat Strength); hits on 5-6 unless modified (see Modifiers).
  3. **Leader Re-Roll**: Reroll misses up to Leadership (max 5); hits on 5-6 unless modified or forfeited.
  4. **Remove Casualties**: Attacker removes first:
     - 1 hit = 1 Regular removed.
     - 2 hits = 1 Elite removed.
     - 1 hit = replace Elite with Regular from reinforcements (SP: reinforcements, FP: dead pile if available).
     - 1 hit = remove Elite if no replacements.
     - FP units/leaders/Characters removed permanently (except Gandalf the White or Hobbits via abilities); SP units/Nazgûl to reinforcements; Minions removed permanently.
     - Characters outside Fellowship die only with their army; if all units die, remove leaders/Nazgûl/Characters.
  5. **Stopping or Retreating**: 
     - Attacker decides to continue; if not, army stays in region.
     - If continuing, defender may retreat to an adjacent free region or Stronghold (besieged if in same region).
     - No retreat into enemy army or controlled Settlement; army stays if no retreat possible.
- **End of Battle**: Ends when attacker stops, defender retreats, or one/both sides eliminated. Attacker may advance if defender dies/retreats; siege begins if defender retreats into Stronghold.
- **Modifiers**: 
  - Stronghold: Attacker hits on 6, defender on 5 (see Sieges).
  - City/Fort (first round): Attacker hits on 6, defender on 5; subsequent rounds 5-6.
  - Combat cards may modify rolls/rerolls (e.g., "Sudden Strike" pre-rolls Leadership).
  - Natural 1 always misses, natural 6 always hits.

## Forts, Cities, and Sieges
### Forts and Cities
- **Function**: Identical in combat; located at Osgiliath and Fords of Isen.
- **Combat**: First round, attacker hits on 6, defender on 5; subsequent rounds, both hit on 5-6.

### Strongholds and Sieges
- **Field to Siege**: Army in a Stronghold region may fight a field battle or retreat into siege before any round; move defenders to Stronghold box (update `siegeStatus: in`), battle ends, attacker may advance.
- **Siege Rules**:
  - Max 5 units in Stronghold; excess to reinforcements.
  - Holds all leaders/Characters; no retreat or movement (except sortie).
  - Besieging army moves as if owning the region.
  - Siege breaks when region has no enemy units; defenders return to map (`siegeStatus: out`).
- **Siege Battles**:
  - Use Army/Character die (if Leadership attacking); must be in Stronghold region.
  - Attacker hits on 6, defender on 5; 1 round unless extended.
  - Attacker may reduce Elite to Regular for extra round (repeat as needed).
  - If both survive, siege persists (`siegeStatus: in`).
- **Sortie**:
  - Stronghold army attacks besiegers with Army/Character die (if Leadership); resolved as field battle (both hit on 5-6).
  - If attackers stop, return to Stronghold (`siegeStatus: in`); advancing places figures on map (`siegeStatus: out`).
- **Relieving a Siege**: Adjacent FP army attacks besiegers in field battle; Stronghold army uninvolved until besiegers gone.
- **Reinforcing a Siege**: Besiegers add units via movement, not attacks.

## Politics
- **Activation**: Nation entered, attacked, or Fellowship/Companion declares in its City/Stronghold.
- **Advancing**: Muster die moves Active nation to “At War”; battle or Settlement capture advances.
- **At War**: Armies can attack, move into other nations, muster with dice.

## The Fellowship
- **Movement**: Character die advances Progress Counter (hidden); triggers Hunt.
- **Guide**: Highest Level (e.g., Gandalf 3, Strider 3); FP chooses on tie. Gollum (1/0) if no Companions.
- **Corruption**: 0-12; 12 = SP victory.
- **Separation**: Character die; move Level + Progress Counter regions; eliminated in Mordor.

## Hunt for the Ring
- **Pool**: 12 numbered (0-3, some with 👁), 4 Eye. *Note*: Special tiles added via expansions.
- **Hunt Roll**: Roll Hunt box dice (max 5); +1 per prior move this turn; success on 6+ (reroll per SP army, Nazgûl, Stronghold in region).
- **Tile Effects**:
  - Number (0-3): Damage.
  - 👁: Damage = successes, reveal.
- **Damage**: Corruption, eliminate Companion (reduce by Level, excess as Corruption).

## Mordor Track
- **Entry**: Declare in Morannon/Minas Morgul; reset Hunt Pool with Special tiles (*expansion hook*).
- **Movement**: Hidden only; draw tile per move (no roll); Eye = Hunt box Eyes + prior moves.
- **Inactivity**: +1 Corruption if revealed and no move/hide all turn.

## Victory Conditions
- **Military**: SP 10+ VP at turn end; FP 4+ VP immediately if SP <10.
- **Ring**: SP wins if Corruption = 12; FP wins if Fellowship reaches Cracks of Doom (Mordor Track end) with <12 Corruption.

## Edge Cases
- **Nazgûl**: Move freely unless card specifies (e.g., "The Nazgûl Strike!").
- **Siege Stacking**: 5 units max in Stronghold; excess retreat or reinforce adjacent region.
- **Companion Separation**: Eliminated in Mordor; if all separate, Gollum becomes Guide.
- **Multiple Army Moves**: 2 armies, 1 region each per Army die; no splitting mid-move.
- **Stronghold Recapture**: FP recaptures if no SP units remain after battle.

## Future Expansions and Scenarios
- **Expansions**: Placeholder for "Lords of Middle-earth," "Warriors of Middle-earth," "Kings of Middle-earth":
  - Additional cards, characters, dice, Hunt tiles to be seeded in `cards`/`characters` collections.
  - Modular rules to be added to `validateMove`.
- **Scenarios**: Placeholder for "Breaking of the Fellowship," "Treebeard":
  - Pre-configured states in JSON configs.

## Developer Notes
- **State Tracking**: `gameState`: Include `siegeStatus` (in/out), `combat {attacker, defender, region, round, leadershipForfeited {free, shadow}, combatCards {free, shadow}}`, encrypted in MongoDB.
- **Rules Enforcement**: `validateMove`: Check combat card timing, Leadership forfeiture, siege transitions (e.g., Elite reduction), sortie rules.
- **UI Components**: `SiegeBox`: Display Stronghold status (in/out), units, besiegers.
- **Testing**: Validate siege battles (6 vs. 5 hits), sortie (5-6 hits), card interactions (e.g., "Grond").

## Appendix A: Event Cards (96 Total)
### Free Peoples Character (24)
1. **Elven Cloaks**: Add [0] tile when Fellowship enters Mordor Track.
2. **Phial of Galadriel**: Add [-2] tile when on Mordor Track.
3. **Athelas**: Roll 3 dice (5+ heals 1 Corruption per success); play if Strider/Aragorn with FP army.
[... Full list, e.g., "Mithril Coat and Sting," "The Eagles are Coming!" ...]
24. **There is Another Way**: Move Fellowship 1 region toward Minas Morgul/Morannon if Hidden and not in Mordor.

### Free Peoples Strategy (24)
1. **Muster the Ents**: Recruit 2 Elites in Fangorn if Gandalf with FP army.
2. **The Ents Awake: Huorns**: Move army from Fangorn/Rohan to besiege Orthanc if “Ents Awake” on table.
[... Full list, e.g., "Dead Men of Dunharrow," "Horn of Gondor" ...]
24. **The Last Battle**: Play if FP army in Mordor; Hunt dice don’t trigger Hunt effects.

### Shadow Character (24)
1. **Cruel Weather**: Fellowship moves only to adjacent region this turn.
2. **Shelob’s Lair**: Add [die, stop] tile when Fellowship enters Mordor Track.
[... Full list, e.g., "Nazgûl Search," "The Ringwraiths Are Abroad" ...]
24. **Pits of Mordor**: Reveal Fellowship if on Mordor Track; +2 Corruption.

### Shadow Strategy (24)
1. **Wormtongue**: Rohan can’t advance to “At War” this turn if Saruman active.
2. **The Nazgûl Strike!**: Move all Nazgûl to 1 region; discard FP “Axe and Bow” or roll Hunt die (6 = +1 Corruption).
[... Full list, e.g., "Grond, Hammer of the Underworld," "Siege Towers" ...]
24. **Rage of the Dunlendings**: +1 die to attack from Dunland/Orthanc if Isengard “At War.”

## Appendix B: Combat Cards (62 Total)
### Examples
1. **It is a Gift**: +1 die if Fellowship with FP army; discard after roll.
2. **Sudden Strike**: Pre-roll Leadership dice; hits count toward battle.
3. **Blade of Westernesse**: Eliminate 1 Minion if Hobbit with FP army; discard.
[... Full list, e.g., "One for the Dark Lord," "Desperate Battle" ...]
62. **The Lidless Eye**: Reroll all dice if Witch-king in battle; discard.

## Appendix C: Characters (8 Total)
1. **Gimli**: Level 2, Leadership 1, “Dwarf of Erebor” (advance Dwarves 1 step when separated).
2. **Saruman**: Level 3, Leadership 2, muster in Orthanc if Isengard active.
[... Full list, e.g., "Gandalf the White," "Gollum" ...]
8. **Gollum**: Level 1, Leadership 0, Guide reduces Hunt damage by revealing (if no Companions).
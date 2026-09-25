# Steel Ball Run: The Corpse Road

A fan-made browser roguelite based on *JoJo's Bizarre Adventure Part 7: Steel Ball Run*. Ride from San Diego to New York as Johnny, Gyro, Mountain Tim or Hot Pants. Recruit the others, walk a Path, detour through the Devil's Palm, and fight the President's Stand users in turn-based energy combat. The run structure is modelled on the Roblox game *An Average Campaign*.

All the art is drawn in code as SVG and canvas. All the music and sound effects are synthesized in WebAudio. There are no image or audio assets and no build step.

![Title screen](docs/media/title.jpg)

**[🎮 Play now](https://steel-ball-run-kohl.vercel.app)** · **[▶ Watch the demo video](docs/media/demo.webm)** · **[Showcase page](docs/index.html)**

## Play

Open `index.html` in any modern browser, or serve the folder:

```bash
python -m http.server 5178
```

Then open <http://localhost:5178>. Progress saves in your browser's local storage.

## Screenshots

| | |
|---|---|
| ![Encounter cards](docs/media/cards.jpg) **Encounter cards.** Every card type has its own drawn illustration, and each deal is announced by a slashing "ENCOUNTER!" banner. | ![Battle](docs/media/battle.jpg) **Stand battles.** Stands appear when their abilities fire, and some hover beside their user for the whole fight. |
| ![Cut-in](docs/media/cutin.jpg) **Manga cut-ins.** Big moves slam a diagonal panel across the screen with the attacker and the move's name. | ![Boss intro](docs/media/bossintro.jpg) **Boss intros.** Each Stand user explains their mechanic before the fight. |
| ![Lead riders](docs/media/setup.jpg) **Lead riders and horses.** Pick your lead, a horse and a starting item. The horse gives resistances the way a race does in AAC. | ![Paths](docs/media/paths.jpg) **Paths.** Each lead has three subclasses, learned from trainers on the road. |
| ![Detours](docs/media/detours.jpg) **Detour areas.** Four optional regions, each with its own hazard, enemies, materials and boss. | ![Resistances](docs/media/resist.jpg) **Damage types.** Every hit has a type, and every enemy has its own resistances and weaknesses. |
| ![Gear](docs/media/gear.jpg) **Six gear slots.** Weapon, hat, coat, boots and two charms. Charms of the same family don't stack. | ![Sprint](docs/media/sprint.jpg) **Stage sprints.** Time your presses to the golden zone while rivals use their Stands against you. |

## How a run plays

1. **Choose a lead rider, a horse and a starting item.**
   - Johnny and Gyro are available from the start. Mountain Tim unlocks when you clear Act II, and Hot Pants when you clear Act III.
   - Johnny and Gyro always join the story, whoever you pick.
   - Your lead never leaves the party. Story departures become wounds or changes of heart instead.
2. **Ride through six acts.** They follow the real race legs: the Arizona desert, the Rockies, the Midwest, the frozen north, Philadelphia and New York.
3. **Choose an encounter each stage.** You get three cards: a fight, a shop, a story event with a d20 skill check, a trainer, an ally or a detour. You can also Scavenge or take a Short Rest instead.
   - Every event choice changes something: an ally joins, you gain gear, a fight breaks out, a stat changes, or a flag is set that comes back later.
   - Rob the boy in the ditch and his brother hunts you down two acts later.
4. **Walk a Path.** Each lead has three Paths, which play the role of AAC's subclasses. Trainers on the road teach them: pass their check or beat them in a duel.
   - A Path gives a passive bonus, resistances, and three abilities that unlock at levels 1, 3 and 5. Taking one closes off the other two.
   - Johnny: Jockey, Nail Gunner, Heir to the Golden Spin.
   - Gyro: Royal Executioner, Zeppeli Physician, Golden Rider.
   - Mountain Tim: Sheriff, Lonesome Rope, Rancher.
   - Hot Pants: Sister of the Vatican, Flesh Sprayer, Corpse Hunter.
5. **Take a detour.** Detours are optional side areas, like AAC's Mines and Sewer. Each has a hazard that affects every battle inside it, its own enemies and materials, story events and a boss. You then rejoin the race a little behind the pack.

   | Detour | Hazard | Boss |
   |---|---|---|
   | The Devil's Palm | Scorching heat | A boss whose immunity shifts to a new damage type every round |
   | The Silver Mine | Cave-ins | A dinosaurified fossil colossus |
   | Frozen Lake Michigan | Blizzard | The White Alpha and its pack |
   | Philadelphia Rail Yard | Crowded train cars | Tattoo You!'s eleven men acting as one |

6. **Fight.** Every unit, ally or enemy, starts a battle with 1 Energy and gains 1 per turn.
   - Hits have one of nine damage types: Physical, Gunshot, Spin, Stand, Bleed, Cold, Sound, Holy and True.
   - Resistances add together and come from enemies, horses, gear, Paths and statuses. True damage ignores them. For example, Blackmore is immune to Cold, ghosts shrug off bullets, and Valentine is weak to Spin.
7. **Gear up.** Enemies drop materials and Stand Remnants for the crafting bench.
   - Each rider wears a weapon, a hat, a coat, boots and two charms.
   - Charms belong to families, and two charms from the same family don't stack.
8. **Beat the act boss, then race to the finish.** Each boss's mechanic comes from their Stand:
   - Ringo's Mandom rewinds six seconds, and he shoots first afterwards.
   - Blackmore hides in frozen rain that only Spin attacks can pierce.
   - Valentine's copies take his hits.
   - Diego's THE WORLD stops time more often as he gets desperate.
9. **Build up across runs.** Race Points buy permanent Techniques. Achievements unlock lead riders, horses, starting items and Techniques.

## Materials, gear and money

The crafting system follows *An Average Campaign*: a few materials that are reused everywhere.

- **16 materials.**
  - Nine generic: Scrap Iron, Leather, Cloth, Gunpowder, Frontier Herbs, Pelts & Feathers, Bone & Fang, Silver and Gold.
  - Five special: Steel Ball Shard, Golden Sap, Menger Dust, Frozen Water and Fossil Shard.
  - Two found only on detours: Devil's Palm Sand and Eleven Men Ink.
  - Every material is used in at least four recipes. Its tooltip lists where it drops and what it makes.
- **Souls.** Stand Remnants are recipe keys. Owning one unlocks that boss's gear for the rest of the run, and crafting never uses it up.
- **Upgrades.** Some recipes take a piece you already own and make a better one. For example, a Colt Navy becomes a Winchester '73, and Riding Boots become Cavalry Boots.
- **Reinforce and salvage.**
  - At the bench, any piece can be raised to +1 and then +2. It costs materials that match its slot, plus money.
  - A blacksmith in town does the same for money only.
  - Salvaging gear gives back half its materials.
- **Tracking.** Pin a recipe and its missing materials show in the HUD. The Craft tab shows how many recipes you can make right now, and the bench has a "Craftable now" filter.
- **Money has uses.**
  - Shops buy gear, supplies and sell-only trinkets, such as Sandman's emerald.
  - Town services: a doctor, a farrier, guides, the telegraph office, the church, newspaper adverts and the blacksmith.
  - Paid training.
  - Stage checkpoint fees, which you can dodge if you don't mind the law remembering.
  - Bribing a scout to redraw the stage's encounters.

## More of Steel Ball Run

About 26 encounters are taken from the manga's side stories, in race order. They include:

- Mr. Steel's press tent, and Sandman trying to pay with an emerald.
- Mountain Tim's dented horseshoe, and the Boomboom family framing you in disguise.
- Gaucho and Ringo's cabin, the Green Tomb pigeon, Dot Han caught by In a Silent Way, and Diego thrown in the storm.
- The Milwaukee casino and its eleven men, the log road under the ice, the wolf carrying the Corpse's legs, Nicholas's boots and Kuma-chan, and the First Lady's hotel in Chicago.
- Magent in the Delaware River, Lucy at Independence Hall, the steamboat *Blue Hawaii*, and Trinity Church.

Other racers join the leaderboard: Sloop John B, Georgy Porgy, Nellyville, Gaucho, Mack the Knife, Dixie Chicken, Baba Yaga and Norisuke Higashikata. Tubular Bells now happens in Chicago, in Act IV.

## Your choices matter

Every choice feeds a hidden world state, like a tabletop campaign. Nothing tells you what a choice will do.

- **Six factions remember you.** The President, the Vatican, the racers, Sandman's people, the House of Naples and the law.
- **Recurring people remember you too.** The scout, the Blackwood brothers, the farrier, Mrs. Robinson, Oyecomova, Dot Han and others.
- **Consequences come back later as their own encounters.** Spare Mrs. Robinson and he returns with a warning about Blackmore's rain. Burn an agents' camp and you meet the farmer whose harvest burned.
- **Story beats branch.**
  - Warn Mountain Tim and he survives Kansas City.
  - Earn Hot Pants' trust and she refuses to steal the Corpse.
  - Befriend the scout and you can talk Sandman out of the fight.
  - Take Valentine's napkin and become the President's Knight.
  - Keep Naples on your side and Gyro can survive the Love Train.
- **Six endings.** They are chosen by what you did, not only by where you finish.
- **The Chronicle** (`J`, or the tab on the left) records your deeds. When a consequence finally happens, it writes what the deed caused in red ink. The ending shows the full list.

## Debugging

Press the backtick key (`` ` ``) or open `index.html?debug` for the debug panel. It jumps to any act, stage, side event, story scene, fight, boss lineup, detour, sprint or ending, with the lead, level, threat and faction standing you choose. The same jumps are scriptable from the console as `SBR.debug.*`.

## Music

Every act, every detour, normal, elite and boss battles, the sprint and the saloon each have their own synthesized theme. Diego and Valentine get their own boss themes. Music volume is in Settings.

The game can't ship music from other games or anime. To use your own tracks locally:

1. Create a `music/` folder next to `index.html`. It is gitignored.
2. Put your audio files in it.
3. Add a `manifest.json` that maps theme keys to files, for example `{"act1": "desert.mp3", "boss": "boss.ogg"}`.

The theme keys are `title`, `act1` to `act6`, `devilspalm`, `silvermine`, `lakeice`, `railyard`, `battle`, `elite`, `boss`, `boss_diego`, `boss_valentine`, `sprint` and `shop`. Your own tracks only load when the game is served from localhost.

## Controls

| Key | Action |
|---|---|
| `1`–`7` | Use an ability, or pick an encounter card |
| `Q` / `E` | Brace / use an item |
| `P` `B` `C` `M` `J` | Party, Bag, Crafting, Map, Chronicle (also the tabs on the left of the screen) |
| `` ` `` | Debug panel |
| `Space` | Advance dialogue / surge in the sprint |
| `Esc` | Settings (speed, sound and music volume, screen shake, reduced motion) |

## Code layout

| File | Contents |
|---|---|
| `js/core.js` | Namespace, utilities, save data, sound-effect synth, tooltips |
| `js/audio.js` | Music sequencer and themes, ambience, extra sound effects, your-own-tracks loader |
| `js/art.js` | Portraits, horses, parallax scenes, the US map |
| `js/icons.js` | Drawn icons for items, materials, gear, abilities, statuses and damage types |
| `js/stands.js` | Drawn Stand figures, their flashes and the Stands that hover beside their users |
| `js/jojo.js` | Encounter card illustrations, manga cut-ins, To Be Continued, the title logo |
| `js/data.js` | Stats, damage types, statuses, party abilities, characters, horses, items, techniques, achievements |
| `js/enemies.js` | Enemies, bosses, their Stand mechanics and resistances |
| `js/story.js` | Acts, rivals and dialogue scenes, including lines that change with your lead |
| `js/events.js` | Side encounters, their choices, and the follow-up events those choices trigger |
| `js/paths.js` | Paths (subclasses), their abilities, trainers and emblems |
| `js/crafting.js` | Materials, Stand Remnants, equipment and slots, recipes, drop tables |
| `js/variety.js` | Threat, generated fights, enemy traits, race conditions, act lineups |
| `js/sbr.js` | Racers, canon side-story encounters, manga items, Act IV Tubular Bells |
| `js/economy.js` | The 16 materials, Souls, upgrades, reinforce, salvage, selling, trinkets, services, fees |
| `js/campaign.js` | World state, factions, consequences, follow-up encounters, story branches, endings, the Chronicle |
| `js/debug.js` | Debug panel and `SBR.debug` jump API |
| `js/areas.js` | Detour areas, hazards, their enemies, bosses, events and gear |
| `js/combat.js` | Combat engine: pure state plus an event log |
| `js/fx.js` | Canvas VFX: projectiles, slashes, spirals, damage-over-time effects |
| `js/battle-ui.js` | Replays combat events as animations and handles input |
| `js/sprint.js` | The stage-finish race |
| `js/ui.js` / `js/main.js` | Screens, drawers and dialogue; game flow and the event API |

## Credits

This is a non-commercial fan project. Characters, Stands and story beats belong to Hirohiko Araki's *Steel Ball Run*. The structure is inspired by *An Average Campaign*. The dialogue, art, music, code and game design are original.

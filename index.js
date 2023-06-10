enabled = false; // Change to false to disable the script
mostRecentBoss = "NONE";
kills_mo = 0;
kills_bs = 0;
kills_af = 0;
kills_bd = 0;
kills_mb = 0;
bossDict = {"ASHFANG": kills_af, "BARBARIAN DUKE X": kills_bd, "MAGMA BOSS": kills_mb, "MAGE OUTLAW": kills_mo, "BLADESOUL": kills_bs}
bossStrings = {"ASHFANG": "&8Ashfang", "BARBARIAN DUKE X": "&cBarbarian Duke X", "MAGMA BOSS": "&4Magma Boss", "MAGE OUTLAW": "&5Mage Outlaw", "BLADESOUL": "&8Bladesoul"}

sessionStartTime = 0;

cycleStartTime = 0;
cycleCount = 0;

const display = new Display();
display.addLine(new DisplayLine("&c&l4/4 RESET").setScale(2));
display.setAlign("center");
display.setRenderLoc(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2.2);
display.hide();

followCommand = "/sbwarptoken 000000000000000000000000"

// TODO
// End Session after no activity?
// Antiwarp at 4/4?



// DETECT WHEN A BOSS IS KILLED
register("chat", (spacer, boss) => {
    //Check if they are killing a whitelisted boss
    if(!(boss in bossDict)){
        return;
    }
    setTimeout(() => {
        bossKilled(boss);
    }, 20);
    if(!enabled){
        promptSessionStart();
        return;
    }
}).setCriteria("&r&r&r${spacer}&r&6&l${boss} DOWN!&r");

function promptSessionStart(){
    // Clickable Text
    let text = new TextComponent("&eNo session active. Click &b&lHERE&e to start a session.");
    text.setClick("run_command", "/startsession");
    text.setHoverValue("&aClick here to start a session.");
    text.chat();
}

// SESSION COMMANDS
register("command", () => {
    if(enabled){
        ChatLib.chat("&cSession already active. Use /endsession to end it.");
        return;
    }
    else{
        enabled = true;
        sessionStartTime = Date.now();
        cycleStartTime = Date.now();
        ChatLib.chat("&aSession started.");
    }
}).setName("startsession");

function getSessionStats(){
    statsString = "&bTotal Time Elapsed: &e" + timeElapsedFormatted + "&a.\n";
    for (x in bossDict) {
        if(bossDict[x] > 0){
            statsString += bossStrings[x] + "&a Kills: &e" + bossDict[x] + "&a. Avg " + new Date(timeElapsed / bossDict[x]).toISOString().substr(14, 5) + "&a " + "per.\n";
        }
    }
    return statsString;
}

register("command", () => {
    if(!enabled){
        ChatLib.chat("&cNo session active. Use /startsession to start a session.");
        return;
    }
    else{
        enabled = false;
        timeElapsed = Date.now() - sessionStartTime;
        if(timeElapsed < 3600000){
            timeElapsedFormatted = new Date(timeElapsed).toISOString().substr(14, 5);
        }
        else{
            timeElapsedFormatted = new Date(timeElapsed).toISOString().substr(11, 8);
        }
        statsString = getSessionStats();
        text = new TextComponent("&aSession ended. Total time elapsed: &e" + timeElapsedFormatted + "&a. &b&lHOVER&a for session stats.");
        text.setHoverValue(statsString);
        text.chat();

        // Reset everything
        kills_af = 0;
        kills_bs = 0;
        kills_bd = 0;
        kills_mb = 0;
        kills_mo = 0;
    }
}).setName("endsession");


// LOGIC FOR WHEN A BOSS IS KILLED
function bossKilled(bossType) {

    // Cycle Count Increase - Same boss again
    if (bossType == mostRecentBoss){
        cycleCount++;
        // Alert if cycle >= 4
        if(cycleCount >= 4){
            ChatLib.chat("&c&l You've killed 4 of the same minboss in a row. Kill a different boss to keep getting loot.");
            display.setRenderLoc(Renderer.screen.getWidth() / 2, Renderer.screen.getHeight() / 2.2);
            display.show();
            setTimeout(() => {
                display.hide();
            }, 5000);

            // Implement Antiwarp
        }
    }
    // Resetting Cycle - Kill new boss (usually after 4/4)
    else if (cycleCount > 1){
        cycleTime = Date.now() - cycleStartTime;
        cycleStartTimeFormatted = new Date(cycleTime).toISOString().substr(14, 5);
        if(enabled){
            ChatLib.chat("&aCycle reset. Time taken: &e" + cycleStartTimeFormatted + "&a.");
            cycleStartTime = Date.now();
        }
        cycleCount = 0;
    }
    else{
        // Increment cycle counter
        mostRecentBoss = bossType;
        cycleCount = 1;
    }

    //Increment counter for specific boss
    if(enabled){
        bossDict[bossType] += 1;
    }
}

// Get Follow Command
register("chat", (player, location, event) => {
    let ReceivedMessage = new Message(EventLib.getMessage(event));
    ReceivedMessage.getMessageParts().forEach((part) => {
        followCommand = part.getClickValue()
    })
}).setCriteria(" &9&l» ${player} &eis traveling to &a${location} &e&lFOLLOW&r");

register("command", () => {
    //run command
    ChatLib.command(followCommand.substring(1));
}).setName("follow");

const followKeybind = new KeyBind("Follow SkyBlock Travel Key", Keyboard.KEY_F, "Crimson Isle Miniboss");
followKeybind.registerKeyPress(() => {
    ChatLib.command(followCommand.substring(1));
});
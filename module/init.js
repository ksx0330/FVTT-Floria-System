
//Import Modules
import { FloriaActor } from "./document/actor.js";
import { FloriaPCSheet } from "./sheet/pc-sheet.js";
import { FloriaItemSheet } from "./sheet/item-sheet.js";


import { FloriaRegisterHelpers } from "./handlebars.js";


/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

/**
 * Init hook.
 */
Hooks.once("init", async function() {
  console.log(`Initializing Floria System`);


  // Register sheet application classes
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("floria", FloriaPCSheet, { makeDefault: true });

  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("floria", FloriaItemSheet, { makeDefault: true });

  CONFIG.Actor.documentClass = FloriaActor;

  FloriaRegisterHelpers.init();

});

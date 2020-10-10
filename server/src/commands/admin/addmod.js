/*
  Description: Adds the target trip to the mod list then elevates the uType
*/

import * as UAC from '../utility/UAC/_info';

// module main
export async function run({
  core, server, socket, payload,
}) {
  // increase rate limit chance and ignore if not admin
  if (!UAC.isAdmin(socket.level)) {
    return server.police.frisk(socket.address, 20);
  }

  // add new trip to config
  core.config.mods.push({ trip: payload.trip });

  // find targets current connections
  const newMod = server.findSockets({ trip: payload.trip });
  if (newMod.length !== 0) {
    for (let i = 0, l = newMod.length; i < l; i += 1) {
      // upgrade privilages
      newMod[i].uType = 'mod';
      newMod[i].level = UAC.levels.moderator;

      // inform new mod
      server.send({
        cmd: 'info',
        text: 'You are now a mod.',
        channel: newMod[i].channel, // @todo Multichannel
      }, newMod[i]);
    }
  }

  // return success message
  server.reply({
    cmd: 'info',
    text: `Added mod trip: ${payload.trip}, remember to run 'saveconfig' to make it permanent`,
    channel: socket.channel, // @todo Multichannel
  }, socket);

  // notify all mods
  server.broadcast({
    cmd: 'info',
    text: `Added mod: ${payload.trip}`,
    channel: false, // @todo Multichannel, false for global info
  }, { level: UAC.isModerator });

  return true;
}

export const requiredData = ['trip'];
export const info = {
  name: 'addmod',
  description: 'Adds target trip to the config as a mod and upgrades the socket type',
  usage: `
    API: { cmd: 'addmod', trip: '<target trip>' }`,
};

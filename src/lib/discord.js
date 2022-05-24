import DiscordJS, { Intents } from "discord.js"

const token = import.meta.env.VITE_PUBLIC_DISCORD_TOKEN

export const discord = new DiscordJS.Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
})

discord.on("ready", () => {
	console.log("wasp-webapp bridge ready!")
})

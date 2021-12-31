//Requires
const modulename = 'mute';
const { dir, log, logOk, logWarn, logError } = require("../../src/console")(modulename);

const validTimes = { m: 60000, h: 3600000, d: 86400000, w: 604800000 }

const parseTime = (str) => {
    // creds go to goat and me
    const match = str.match(/(\d+)\s?([mhdw])/)
    if (match && validTimes[match[2]]) {
        return parseInt(match[1] * validTimes[match[2]])
    }
    return
}

module.exports = {
    description: 'Mutes a person for x amount of time',
    async execute (message, args, config) {
        //Check permission
        if (!message.txIsAdmin) {
            return message.reply(`You're not allowed to use this command.`);
        }

        const mentionedMember = message.mentions.members.first();
        if (!mentionedMember) return message.reply('You have to mention one user');
        if (typeof args[0] === 'undefined') return message.reply('Please use the correct command format. `!mute @mention 1w/1d/1h/1m reason`');
        if (mentionedMember.user.id === message.author.id) return message.reply('u brainlet...'); //user trying to mute himself
        if (mentionedMember.user.id === message.client.user.id) return message.reply('yo, really?'); //user trying to mute chungus

        const isMaintainer = mentionedMember.roles.cache.has(config.maintainerRole);

        if (isMaintainer) return message.reply('🤔 thats not very nice :(');
        //Parsing time
        const parsedTime = parseTime(args[0]);
        if (!parsedTime) return message.reply('Invalid time');
        const reason = args.slice(1).join(" ") || 'No reason specified';
        const expiration = Date.now() + parsedTime;

        try {
            await GlobalActions.tempRoleAdd('muted', mentionedMember.user.id, expiration, reason);
            message.reply(`Muted \`${mentionedMember.displayName}\` for \`${args[0]}\`\nReason: \`${reason}\``);
            log(`${message.author.tag} muted \`${mentionedMember.displayName}\` for \`${args[0]}\` and reason: \`${reason}\``);
        } catch (error) {
            message.reply('Something terrible just happened, fuck. Most likely the member left.');
            dir(error)
        }

        mentionedMember.send(`You have been muted for \`${args[0]}\`\nReason: \`${reason}\``).catch(()=>{});
    }
};

    const { getServerDB } = require('./DataBase');

    module.exports = {
        name: 'removeyen',
        aliases: ['ry'],
        description: "Retire de l'argent au joueur",

        async execute(message, args) {

            const db = getServerDB(message.guild.id);
            const quantity = parseInt(args[0]);
            const target = message.mentions.users.last();
            
            const allowedRoles = ["1403888481356353639"];
            if (!message.member.roles.cache.some(role => allowedRoles.includes(role.id))) {
                return message.channel.send("❌ Tu n'as pas la permissions d'utilisé cette commande.")
            }

            if (!quantity || quantity <= 0 || isNaN(quantity)) {
                return message.reply("Vous devez indiquer une certaines somme");
            }

            if (!target) {
                return message.channel.send("Tu dois mentionner un joueur");
            }

            let row =db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(target.id);

            if (!row) {
                db.prepare("INSERT INTO banques (user_id, banque) VALUES (?, ?)").run(target.id, 0);
                row = {banque: 0};
            }

            const newBalance = Math.max(0, row.banque - quantity);

            db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(quantity, target.id);

            return message.channel.send(
                `-${quantity}¥ ! **${target.username}** a désormais **${newBalance}¥**`
            );
        }
    };
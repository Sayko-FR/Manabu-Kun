const { checkCooldown } = require('./Cooldown');
const { getServerDB } = require('./DataBase.js');

module.exports = {
    name: 'pfc',
    description: "Jouer au Pierre-Feuille-Ciseaux",

    async execute(message, args) {
        const db = getServerDB(message.guild.id);
        const player1 = message.author;

        const bet = parseInt(args[0]);
        if (!bet || isNaN(bet) || bet <= 0) return message.channel.send("❌ Tu dois indiquer une quantité valide à miser !");

        const player2 = message.mentions.users.last();
        if (!player2) return message.channel.send("❌ Tu dois mentionner un joueur !");
        const mode = 'pfc';

        if (!checkCooldown(player1.id, mode, message) || !checkCooldown(player2.id, mode, message)) return;

        // Vérification des banques
        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(player1.id);
        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(player2.id);

        const rowPlayer1 = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(player1.id);
        const rowPlayer2 = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(player2.id);

        if (rowPlayer1.banque < bet) return message.channel.send("Tu n'as pas assez de yens pour ce jeu");
        if (rowPlayer2.banque < bet) return message.channel.send(`${player2.username} n'a pas assez de yens pour jouer`);

        await message.channel.send(
            `**Bienvenue dans le jeu de PFC !**\u200B` +
            `Vous avez 3 choix possibles : \`pierre\`, \`feuille\`, \`ciseaux\`\n` +
            `**ATTENTION !!** UTILISER || avant et après le choix\n` +
            `⏳ 15 secondes pour choisir ! Vos messages seront supprimés pour garder le secret.`
        );

        const choices = ['||pierre||', '||feuille||', '||ciseaux||'];

        // Timer visuel
        let countDown = 10;
        const timerMessage = await message.channel.send(`⏳ Temps restant : **${countDown}s**`);
        const interval = setInterval(() => {
            countDown--;
            if (countDown > 0) timerMessage.edit(`⏳ Temps restant : **${countDown}s**`);
            else clearInterval(interval);
        }, 1000);

        // Collecte des réponses dans le salon avec suppression des messages
        const filter = m => [player1.id, player2.id].includes(m.author.id) && choices.includes(m.content.toLowerCase());
        let p1Choice, p2Choice;

        const collector = message.channel.createMessageCollector({ filter, time: 15000 });

        collector.on('collect', m => {
            if (m.author.id === player1.id && !p1Choice) {
                p1Choice = m.content.toLowerCase();
                m.delete().catch(() => {});
            } else if (m.author.id === player2.id && !p2Choice) {
                p2Choice = m.content.toLowerCase();
                m.delete().catch(() => {});
            }
        });

        await new Promise(resolve => collector.on('end', resolve));

        clearInterval(interval);
        await timerMessage.edit("⏰ Temps écoulé ! Voici les résultats :");

        if (!p1Choice || !p2Choice) return message.channel.send("⏰ Un des joueurs n'a pas répondu, la partie est annulée.");

        // Calcul du résultat
        const result =
            p1Choice === p2Choice ? "draw" :
            (p1Choice === "||pierre||" && p2Choice === "||ciseaux||") ||
            (p1Choice === "||feuille||" && p2Choice === "||pierre||") ||
            (p1Choice === "||ciseaux||" && p2Choice === "||feuille||") ? "p1" : "p2";

        let winner, loser;
        const prize = bet * 2;

        if (result === "draw") {
            return message.channel.send(`⚖️ Égalité ! Vous avez tous les deux choisi **${p1Choice}**`);
        } else if (result === "p1") {
            winner = player1; loser = player2;
            db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(prize, player1.id);
            db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(bet, player2.id);
        } else {
            winner = player2; loser = player1;
            db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(prize, player2.id);
            db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(bet, player1.id);
        }

        return message.channel.send(
            `🎉 **${winner.username}** a gagné contre **${loser.username}** !\n` +
            `🔹 ${player1.username} ➝ **${p1Choice}**\n` +
            `🔸 ${player2.username} ➝ **${p2Choice}**\n\n` +
            `💰 ${winner.username} remporte **${prize}¥** !`
        );
    }
};

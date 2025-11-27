const {getServerDB} = require('./DataBase');
const { EmbedBuilder } = require('discord.js');
const { checkCooldown } = require('./Cooldown');


module.exports = {
    name: 'sticks',
    description: "Jeu des bâtons",

    async execute(message, args) {
        
        const db = getServerDB(message.guild.id);
        const player1 = message.author;

        // Verification de la mise
        let bet = parseInt(args[0]);
        if (!bet || isNaN(bet) || bet <= 0)  {
            return message.channel.send("❌ Tu dois indiquer une quantité valide à miser !");
        }

        // Détection du mode
        const player2 = message.mentions.users.last();
        const mode = player2 ? 'sticks' : 'stickssolo'; // clé pour cooldownConfig

        // Vérifie le cooldown
        if (!checkCooldown(player1.id, mode, message)) return;
        if (player2 && !checkCooldown(player2.id, mode, message)) return; // si duel → cooldown aussi pour l’adversaire

        let sticks = 21;

        db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(player1.id);
        if (player2) {
            db.prepare("INSERT OR IGNORE INTO banques (user_id, banque) VALUES (?, 0)").run(player2.id);
        }

        if (player2) {

            // Regles du jeu
            await message.channel.send(`Bienvenue au jeu des bâtons, **${player1.username}** et **${player2.username}** !\u200B
Tu as en face de toi ${sticks} bâtons. Les règles du jeu sont très simple : \n
• À chaque tour, tu as la possibilté de retirer 1, 2 ou 3 bâtons. \n
• Le dernier bâtons perd la partie.\n
• Vous avez maximum 10 secondes pour prendre votre décision sinon vous perdez la partie pour inactivité.\n
• À toi de jouer ${player1}`);

            const rowPlayer1 = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(player1.id);
            const rowPlayer2 = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(player2.id);

            if (!rowPlayer1 || rowPlayer1.banque < bet) {
                return message.channel.send("💸 Tu n'as pas assez de yen pour ce pari !");
            }
            if (!rowPlayer2 || rowPlayer2.banque < bet) {
                return message.channel.send("💸 Le joueur mentionné n'a pas assez de yen pour ce pari !");
            }

            
            // Filtre pour les messages
            const filter = m => 
                [player1.id, player2.id].includes(m.author.id) && ['1', '2', '3'].includes(m.content.trim());

            let currentPlayer = player1;

            const price = bet * 3;
            const loss = bet * 2;

            while (sticks > 0) {
                
                const loser = currentPlayer;
                const winner = currentPlayer.id === player1.id ? player1 : player2;

                await message.channel.send(`Il reste ${sticks} bâtons. ${currentPlayer}, combien de bâtons veux-tu retirer ?`);

                const collection = await message.channel.awaitMessages({ filter, max : 1, time: 10000, errors: ['time'] }).catch(() => null);

                if (!collection) {
                    await message.channel.send(`Temps écoulé ! La partie est terminée.`);
                }

                const sticksTaken = parseInt(collection.first().content);
                sticks -= sticksTaken;

                if (sticks <=0) {
                    await message.channel.send(`${currentPlayer} a pris le dernier bâton et perd la partie ! Il perd donc ${loss}¥
                        Le vainqueur remporte la somme de ${gain}`);
                }

                currentPlayer = currentPlayer.id === player1.id ? player2 : player1;
            }
        }

        const rowPlayer1 = db.prepare("SELECT banque FROM banques WHERE user_id = ?").get(player1.id);
        if (!rowPlayer1 || rowPlayer1.banque < bet) {
            return message.channel.send("💸 Tu n'as pas assez de yen pour ce pari !");
        }

        const bot = message.client.user;

        // Regles du jeu
        await message.channel.send(`Bienvenue au jeu des bâtons, **${player1.username}** !\u200B
Tu vas affronter **${bot.username}**
Tu as en face de toi ${sticks} bâtons. Les règles du jeu sont très simple :
• À chaque tour, tu as la possibilté de retirer 1, 2 ou 3 bâtons.
• Celui qui prend le dernier bâton perd la partie.
• Vous avez maximum 10 secondes pour prendre votre décision sinon vous perdez la partie pour inactivité.
• Si tu gagnes tu auras 3 fois la somme misé.
• **ATTENTION** tout gourmand doit savoir résister. Si tu perds contre le bot du te verras retirer le double de la somme miser. A tes risques et périls **${player1.username}**
• À toi de jouer ${player1.id}`);

        let currentPlayer = player1;
        const botChoice = [1, 2, 3];
        
        const price = bet * 3;
        const loss = bet * 2;

        // Filtre pour les messages
        const filter = m => 
            m.author.id === player1.id && ['1', '2', '3'].includes(m.content.trim());

        while (sticks > 0) {
            if (currentPlayer.id === player1.id) {
                await message.channel.send(`Il reste ${sticks} bâtons. ${player1}, combien de bâtons veux-tu retirer ?`);  
                const collection = await message.channel.awaitMessages({ filter, max : 1, time: 10000, errors: ['time'] }).catch(() => null);

                if (!collection) {
                    await message.channel.send(`Temps écoulé ! La partie est terminée.`);
                }

                const sticksTaken = parseInt(collection.first().content);
                sticks -= sticksTaken;

                if (sticks <= 0) {
                    db.prepare("UPDATE banques SET banque = banque - ? WHERE user_id = ?").run(loss, player1.id);
                    await message.channel.send(`${currentPlayer.username} a pris le dernier bâton et perd la partie`);
                }
            } else {
                const botSticks = Math.min(sticks, botChoice[Math.floor(Math.random() * botChoice.length)]);
                sticks -= botSticks;
            
                await message.channel.send(`${bot.username} retire ${botSticks} bâton(s). Il reste ${sticks} bâtons.`);

                if (sticks <= 0) {
                    db.prepare("UPDATE banques SET banque = banque + ? WHERE user_id = ?").run(price, player1.id);
                    await message.channel.send(`${currentPlayer.username} a pris le dernier bâton et perd la partie. ${player1.username} remporte ${price}¥ !`);
                }
            }

            currentPlayer = currentPlayer.id === player1.id ? bot : player1;
        }
    }
};
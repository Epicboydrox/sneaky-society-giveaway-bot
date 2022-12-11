const { MessageEmbed, MessageButton, MessageActionRow, Client, Interaction} = require('discord.js')

const Builder = require("@discordjs/builders")

const parse = require("parse-ms")

let ended = false

const ms = require('ms')

const { Database } = require("easymapdb")

const db = new Database("./database.json")

/**
 * 
 * @param {Client} client 
 * @param {Interaction} interaction 
 */
module.exports.Manager = async (client, interaction,options = {giveawayOption: {prize: '', time: 0, channel: null}, button: {emoji: "🎉", StartStyle: "SUCCESS", EndStyle: "DANGER"}, embed: {StartColor: "GREEN", EndColor: "BLURPLE"}}, req) => {
    options = {giveawayOption: {prize: '', time: 0, channel: null}, button: {emoji: "🎉", StartStyle: "SUCCESS", EndStyle: "DANGER"}, embed: {StartColor: "GREEN", EndColor: "BLURPLE"}}
        if(!interaction.isCommand())return;
    let time1 = interaction.options.getString('time')
    const requirements = req ? `\n\n**Requirements: ${req}**\n` : ""
    let prize = interaction.options.getString('prize')

    let channel1 = interaction.options.getChannel("channel")

    const JoinGiveawayButton = new MessageButton()

    .setEmoji(options.button.emoji)

    .setCustomId("jg")

    .setStyle("SUCCESS")

    .setLabel("")

    const endButton = new MessageButton()

    .setStyle("DANGER")

    .setCustomId("End")

    .setLabel("End the Giveaway Early")

    const row = new MessageActionRow()

    .addComponents(JoinGiveawayButton, endButton)

    const time = ms(time1)

    console.log(time)

    let parsed1 = parse(time);

    let parsedTime1 = `<t:${time}>`

    const embed = new MessageEmbed()

    .setTitle("<:giveaways:1051520001712074782>"   + prize)

    .setAuthor("Sneaky Society","https://images-ext-1.discordapp.net/external/zyTdKBNTTMDrSkYS5W_FXak51NK_zxam6Oa1BGPTkik/%3Fsize%3D4096/https/cdn.discordapp.com/icons/1045737080812224652/a_4ca8a3730c25f9e528ad3d2a97a9476c.gif")
      .setThumbnail("https://media.discordapp.net/attachments/862160185116459048/874508318876520478/Sneaky-Emote-3_2_2.png?width=414&height=414")

    .setColor("#4bfd49")
   

    .setDescription(`Ends In ${parsedTime1}\n**Hosted By** ${interaction.user} ${requirements}\n<:wumplove:1051515948244414474> Hope You Win!! \n\nPress ${options.button.emoji} to enter the giveaway`)

    let channel;// = interaction.channel

    try{
    channel = client.channels.cache.get(channel1.id)
    }catch(err){
    channel = interaction.channel
    }

    channel.send({"embeds": [embed], components: [row]}).then(r => {
    
        db.set(`giveawayTime_${r.id}`, Date.now() +time)

        const collector = r.channel.createMessageComponentCollector({"componentType": "BUTTON", time: time})

        collector.on("collect", async (i) => {
            console.log(i.user.id)
            if(i.customId == "jg"){
              let arr = await db.get(`entries_${i.message.id}`)
              console.log(arr)
            if(!arr) arr = []
               console.log(arr)
                if(arr.includes(i.user.id)){
                i.deferUpdate()
                i.user.send({content: "You have already joined the giveaway", "ephemeral": true})
                } else {
                arr.push(i.user.id)
                arr = await db.set(`entries_${i.message.id}`, arr)
                console.log(arr)
                const reg = /Entries: \*\*(\d+)\*\*/
                const executed = reg.exec(i.message.embeds[0].description)
                // console.log(executed)
                const totalEntries = executed ? Number(executed[1]) : 0
                embed.description = `Ending In ${parsedTime1}\n**Hosted By <@${interaction.user.id}>**${requirements}\nEntries: **${totalEntries + 1}**\n\n <:wumplove:1051515948244414474> Hope You Win!! \n\nPress ${options.button.emoji} to enter the giveaway`
                i.message.edit({
                  embeds: [ 
                    embed
                    ]
                })
                i.deferUpdate()
                i.user.send({"content": "You have successfully joined the giveaway", "ephemeral": true})

                }
        }

        if(i.customId == "end"){

            if(!i.memberPermissions.has(["MANAGE_CHANNELS", "MANAGE_MESSAGES"])){

                i.reply({content: "You Don't Have Enough Permissions, Required permissions \"MANAGE_CHANNELS\" and \"MANAGE_MESSAGES\"", ephemeral: true})

            }else{

                collector.stop(`Ended By ${i.user.id}`)

            }

        }

        })

        collector.on("end", (collected) => {

            if(!collected.size){

                interaction.user.send({content: "There were no entries in the giveaway"})

                
                const EndGiveawayButton1 = new MessageButton()

                .setEmoji(options.button.emoji)
            
                .setCustomId("jg")
            
                .setStyle("DANGER")

                .setLabel("join")

                .setDisabled(true)

                const roww = new MessageActionRow()

                .addComponents(EndGiveawayButton1)

                const endWithNoUsersEmbed = new MessageEmbed()

                .setTitle("No Winners")

                .setDescription(`No one participated in the giveaway so there are no winners\nPrize: ${options.giveawayOption.prize}**\nHosted by **<@${interaction.user.id}>`)

                .setColor("RED")

                r.edit({"embeds": [endWithNoUsersEmbed], "components": [roww]})

            }else{

                let arr = db.get(`entries_${r.id}`)

                let Random = Math.floor(Math.random() * arr.length)

                let winner = arr[Random]

                const winEmbed = new MessageEmbed()

                .setTitle(prize + " | Giveaway Ended")

                .setDescription(`${options.giveawayOption.prize}\n\nWinner: <@${winner}>${requirements}\n\n**Hosted by <@${interaction.user.id}>**`)

                .setColor(options.embed.EndColor)
                .setFooter("Click on the blue button to reroll")
                const EndGiveawayButton = new MessageButton()

                .setEmoji(options.button.emoji)
            
                .setCustomId("jg")
            
                .setStyle("DANGER")

                .setLabel("end?")

                .setDisabled(true)

                const rerollButton = new MessageButton()

                .setLabel("reroll? (Click Within 24 Hours)")

                .setCustomId("rr")

                .setStyle("PRIMARY")
                
                const rowA = new MessageActionRow()

                .addComponents(EndGiveawayButton, rerollButton)

                r.edit({embeds: [winEmbed], 'components': [rowA]}).then(console.log("send"))

                r.channel.send({content: `<@${winner}> you have won ${options.giveawayOption.prize}`})

                const rr = r.channel.createMessageComponentCollector({"time": 1000 * 60 * 60 * 24, "componentType": "BUTTON"})

                rr.on('collect', (i) =>{

                    if(i.customId == "rr"){

                        if(!i.memberPermissions.has(["MANAGE_CHANNELS", "MANAGE_MESSAGES"])){

                        i.reply({content: "You Don't Have Enough Permissions, Required permissions \"MANAGE_CHANNELS\" ands \"MANAGE_MESSAGES\"", ephemeral: true})

                        }else{

                            let arr1 = db.get(`entries_${r.id}`)

                            let Random1 = Math.floor(Math.random() * arr1.length)
            
                            let winner1 = arr1[Random1]

                            r.reply({content: `The New Winner is <@${winner1}> and has won ${options.giveawayOption.prize}`})

                        }

                    }

                })

                collector.on("end" , (collected) =>{

                    db.delete(`entries_${r.id}`)

                    ended = true

                })
            }

        })

    })

}

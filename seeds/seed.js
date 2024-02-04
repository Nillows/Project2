const sequelize = require(`../config/connection`);
const {User, Message, Conversation} = require(`../models`);

const userData = [
    {
        username: `fatmanatee0`,
        name: `Logan Lagrange`,
        password: `password`,
        email: `lagrangelogan@gmail.com`
    },
    {
        username: `nillows`,
        name: `Thom Wollin`,
        password: `password`,
        email: ``
    },
    {
        username: `Spec-Tr`,
        name: `Spencer Tyber`,
        password: `password`,
        email: ``
    },
    {
        username: `Ren3546`,
        name: `Renato Valdez`,
        password: `password`,
        email: ``
    }
]

const messageData = [
    {
        content: `Hello everyone`,
        user_id: 1,
        conversation_id: 1,
        nice_date: `2023-12-05 09:32:00`
    }
]

const conversationData = [
    {
        conversation_name: `Test Conversation`
    }
]

const seedMe = async()=>{
    await sequelize.sync({force:true});
    
    const dbUsers = await User.bulkCreate(userData,{
        individualHooks: true
    });
    console.table(dbUsers.map(user=>user.toJSON()));

    const dbConversation = await Conversation.bulkCreate(conversationData);
    console.table(dbConversation.map(conversation=>conversation.toJSON()));

    const dbMessage = await Message.bulkCreate(messageData);
    console.table(dbMessage.map(message=>message.toJSON()));

    await dbUsers[0].addConversation(1);

    await dbConversation[0].addParticipants([1,2]);

    await dbConversation[0].setOwner(1);

    process.exit(0);
}

seedMe();
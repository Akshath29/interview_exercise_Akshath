import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ObjectID } from 'mongodb';
import { MessageData } from './message.data';
import { ChatMessageModel, ChatMessageSchema } from './models/message.model';

import { ConfigManagerModule } from '../configuration/configuration-manager.module';
import {getTestConfiguration}  from '../configuration/configuration-manager.utils';

const id = new ObjectID('5fe0cce861c8ea54018385af');
const conversationId = new ObjectID();
const senderId = new ObjectID('5fe0cce861c8ea54018385af');
const sender2Id = new ObjectID('5fe0cce861c8ea54018385aa');
const sender3Id = new ObjectID('5fe0cce861c8ea54018385ab');

class TestMessageData extends MessageData {
  async deleteMany() {
    await this.chatMessageModel.deleteMany();
  }
}

describe('MessageData', () => {
  let messageData: TestMessageData;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigManagerModule],
          useFactory: () => {
            const databaseConfig =
              getTestConfiguration().database;
            return {
              uri: databaseConfig.connectionString,
            };
          },
        }),
        MongooseModule.forFeature([
          { name: ChatMessageModel.name, schema: ChatMessageSchema },
        ]),
      ],
      providers: [TestMessageData],
    }).compile();

    messageData = module.get<TestMessageData>(TestMessageData);
  });

  beforeEach(
    async () => {
      messageData.deleteMany();
    }
  );

  afterEach(async () => {
    messageData.deleteMany();
  });

  it('should be defined', () => {
    expect(messageData).toBeDefined();
  });

  describe('create', () => {
    it('should be defined', () => {
      expect(messageData.create).toBeDefined();
    });

    it('successfully creates a message', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      expect(message).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationId,
          conversation: { id: conversationId.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
        }
      );

    });
  });


  describe('get', () => {
    it('should be defined', () => {
      expect(messageData.getMessage).toBeDefined();
    });

    it('successfully gets a message', async () => {
      const conversationId = new ObjectID();
      const sentMessage = await messageData.create(
        { conversationId, text: 'Hello world' },
        senderId,
      );

      const gotMessage = await messageData.getMessage(sentMessage.id.toHexString())

      expect(gotMessage).toMatchObject(sentMessage)
    });
  });

  describe('delete', () => {
    it('successfully marks a message as deleted', async () => {
      const conversationId = new ObjectID();
      const message = await messageData.create(
        { conversationId, text: 'Message to delete' },
        senderId,
      );

      // Make sure that it started off as not deleted
      expect(message.deleted).toEqual(false);

      // And that is it now deleted
      const deletedMessage = await messageData.delete(new ObjectID(message.id));
      expect(deletedMessage.deleted).toEqual(true);
    });
  });

  describe('Adding tags to messages', () => {
    it('should successfully add a tag', async () => {
      const conversationIdAdd = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdAdd, text: 'Hello world' },
        senderId,
      );
      const msg = await messageData.addTag("tagx", senderId, message.id);
      expect(msg).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationIdAdd,
          conversation: { id: conversationIdAdd.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
          tags: ["tagx"]
        }
      );

    });

    it('Ensure duplicate tags are not added', async () => {
      const conversationIdDup = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdDup, text: 'Hello world' },
        senderId,
      );
      const msg = await messageData.addTag("tagx", senderId, message.id);
      const msgDupTag = await messageData.addTag("tagx", senderId, msg.id);
      expect(msgDupTag).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationIdDup,
          conversation: { id: conversationIdDup.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
          tags: ["tagx"]
        }
      );
    });
   });

   describe('Removing tags from messages', () => {
    it('Should successfully remove specified tag', async () => {
      const conversationIdRem = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdRem, text: 'Hello world' },
        senderId,
      );
      const msgAddTag = await messageData.addTag("tagx", senderId, message.id);
      const msgRemoveTag = await messageData.removeTag("tagx", senderId, msgAddTag.id);
      expect(msgRemoveTag).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationIdRem,
          conversation: { id: conversationIdRem.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
          tags: []
        }
      );

    });

    it('Remove tags that are added much earlier than current tag', async () => {
      const conversationIdDup = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdDup, text: 'Hello world' },
        senderId,
      );
      const msg = await messageData.addTag("tagx", senderId, message.id);
      const msg2 = await messageData.addTag("tagy", senderId, msg.id);
      const msg3 = await messageData.addTag("tagz", senderId, msg2.id);
      const msg4 = await messageData.removeTag("tagx", senderId, msg3.id)
      expect(msg4).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationIdDup,
          conversation: { id: conversationIdDup.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
          tags: ["tagy", "tagz"]
        }
      );
    });

    it('Return the same message back when attempting to remove tag from empty list', async () => {
      const conversationIdEmpty = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdEmpty, text: 'Hello world' },
        senderId,
      );
      const msgAddTag = await messageData.removeTag("tagx", senderId, message.id);
      expect(msgAddTag).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationIdEmpty,
          conversation: { id: conversationIdEmpty.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
          tags: []
        }
      );

    });

  });

  describe('Removing tags from messages', () => {
    it('Should successfully remove a tag', async () => {
      const conversationIdRem = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdRem, text: 'Hello world' },
        senderId,
      );
      const msgAddTag = await messageData.addTag("tagx", senderId, message.id);
      const msgRemoveTag = await messageData.removeTag("tagx", senderId, msgAddTag.id);
      expect(msgRemoveTag).toMatchObject(
        {
          likes: [],
          resolved: false,
          deleted: false,
          reactions: [],
          text: 'Hello world',
          senderId: senderId,
          conversationId: conversationIdRem,
          conversation: { id: conversationIdRem.toHexString() },
          likesCount: 0,
          sender: { id: senderId.toHexString() },
          tags: []
        }
      );

    });

    it('Find messages based on the tag provided', async () => {
      const conversationIdFind = new ObjectID();
      const message = await messageData.create(
        { conversationId : conversationIdFind, text: 'This message has tagx' , tags : ["tagx"]},
        senderId,
      );
      const message2 = await messageData.create(
        { conversationId : conversationIdFind, text: 'This message has tagy' , tags : ["tagy"]},
        senderId,
      );
      const allmsgs = await messageData.getMessagesGroupedByTags([conversationIdFind], ["tagx"])
      expect(allmsgs).toMatchObject(
        [{"_id": ["tagx"], "messages": [{"message": "This message has tagx"}]}]
      );
    });

  });

  it('Find messages based on the tag provided but only in respective conversationIDs', async () => {
    const conversationIdFind2 = new ObjectID();
    const message = await messageData.create(
      { conversationId : conversationIdFind2, text: 'This message has tagx' , tags : ["tagx"]},
      senderId,
    );
    const message2 = await messageData.create(
      { conversationId : conversationIdFind2, text: 'This message has tagy' , tags : ["tagy"]},
      senderId,
    );

    const message3 = await messageData.create(
      { conversationId : new ObjectID(), text: 'This message has tagx but not the right conversation Id' , tags : ["tagx"]},
      senderId,
    );
    const msgsWithTagX = await messageData.getMessagesGroupedByTags([conversationIdFind2], ["tagx"])
    const allmsgs = await messageData.getMessagesGroupedByTags([conversationIdFind2], ["tagx", "tagy"])
    expect(msgsWithTagX).toMatchObject(
      [{"_id": ["tagx"], "messages": [{"message": "This message has tagx"}]}]
    );
    // As we don't know the order the messages will be found, we can use the no. of elements to verify
    expect(allmsgs).toHaveLength(2);
});

});

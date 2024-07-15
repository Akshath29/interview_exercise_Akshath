import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export type MessageGroupedByTagOutput = {
  _id: string;
  messages: { message: string; senderId: string }[];
  conversationId: string;
  tags : string[]
};

export class MessagesTagFilterInput {
  @ApiProperty({
    required: true,
    description:
      'List of conversationIds for whom the messages are to be fetched',
  })
  conversationIds: string[];

  @ApiProperty({
    description: 'tag to get the messages for',
    required: true,
  })
  tag: string[];
}

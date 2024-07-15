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
      'List of conversationIds whom to search for tagged messages',
  })
  conversationIds: string[];

  @ApiProperty({
    description: 'tag to get the messages for',
    required: true,
  })
  tags: string[];
}

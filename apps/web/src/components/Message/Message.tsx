import { graphql, useFragment } from 'react-relay';
import { DateTime } from 'luxon';
import { Card, CardContent } from '../ui/card';

import { WooviAvatar } from '../../Woovi/WooviAvatar';
import { Message_message$key } from '../../__generated__/Message_message.graphql';

type MessageProps = {
	message: Message_message$key;
};

export const Message = (props: MessageProps) => {
	const message = useFragment<Message_message$key>(
		graphql`
			fragment Message_message on Message {
				content
				createdAt
			}
		`,
		props.message
	);

	return (
		<Card className="border rounded-lg shadow-sm">
			<CardContent className="p-4 space-y-4">
				<div className="flex items-start gap-3">
					<WooviAvatar />
					<div className="flex flex-col">
						<p className="font-medium">Woovi Playground</p>
						<p className="text-sm text-muted-foreground">
							{DateTime.fromISO(message.createdAt || '').toFormat('dd/MM/yyyy HH:mm')}
						</p>
					</div>
				</div>
				<p className="text-sm">{message.content}</p>
			</CardContent>
		</Card>
	);
};

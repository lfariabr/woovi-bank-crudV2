import { Box, Send } from 'lucide-react';
import { useMutation } from 'react-relay';
import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

import { MessageAdd } from './MessageAddMutation';
import { MessageAddMutation } from '../../__generated__/MessageAddMutation.graphql';

type MessageListProps = {
	children?: React.ReactNode;
};

export const MessageList = ({ children }: MessageListProps) => {
	const [content, setContent] = useState('');
	const [messageAdd, isPending] = useMutation<MessageAddMutation>(MessageAdd);

	const handleSubmit = (e) => {
		e.preventDefault();

		messageAdd({
			variables: {
				input: {
					content,
				},
			},
		});

		setContent('');
	};

	return (
		<div className="h-full flex flex-col gap-4 justify-end">
			{children}
			<form onSubmit={handleSubmit} className="w-full">
				<div className="flex gap-2">
					<Input
						placeholder="Type your message..."
						className="w-full"
						value={content}
						onChange={(e) => setContent(e.target.value)}
					/>
					<Button
						type="submit"
						disabled={isPending}
						className="bg-[#03d69d] hover:bg-[#02b987] text-white"
						size="icon"
					>
						<Send className="h-4 w-4" />
					</Button>
				</div>
			</form>
		</div>
	);
};

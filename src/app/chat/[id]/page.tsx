import ChatClient from '../ChatClient';

export default async function ChatDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ChatClient id={id} />;
}

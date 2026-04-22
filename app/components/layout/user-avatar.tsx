import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

type AvatarProps = {
    avatarImageUrl?: string,
    avatarFallBack: string,
}

export default function UserAvatar({ avatarFallBack, avatarImageUrl }: AvatarProps) {
    return (
        <Avatar>
            <AvatarImage src={avatarImageUrl} />
            <AvatarFallback>{avatarFallBack}</AvatarFallback>
        </Avatar>
    );
}
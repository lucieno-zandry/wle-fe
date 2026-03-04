const Highlight = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-primary font-bold underline decoration-primary/30">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export default Highlight;
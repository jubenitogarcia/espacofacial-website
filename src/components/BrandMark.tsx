type Props = {
    className?: string;
    title?: string;
};

export default function BrandMark({ className, title = "Espaço Facial" }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 200 140"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={title}
            className={className}
        >
            <g fill="currentColor">
                <rect x="0" y="0" width="82" height="18" rx="2" />
                <rect x="0" y="44" width="160" height="18" rx="2" />
                <rect x="0" y="44" width="18" height="80" rx="2" />
                <rect x="102" y="106" width="98" height="18" rx="2" />
            </g>
        </svg>
    );
}

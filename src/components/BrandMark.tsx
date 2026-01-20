type Props = {
    className?: string;
    title?: string;
};

export default function BrandMark({ className, title = "Espaço Facial" }: Props) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 220 160"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label={title}
            className={className}
        >
            <g fill="currentColor">
                <rect x="10" y="10" width="200" height="22" rx="2" />
                <rect x="10" y="64" width="200" height="22" rx="2" />
                <rect x="10" y="64" width="22" height="86" rx="2" />
                <rect x="128" y="118" width="82" height="22" rx="2" />
            </g>
        </svg>
    );
}

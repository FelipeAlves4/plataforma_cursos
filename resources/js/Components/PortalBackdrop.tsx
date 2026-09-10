export default function PortalBackdrop() {
    return <div aria-hidden="true" className="portal-backdrop">
        <div className="portal-halo portal-halo-one" />
        <div className="portal-halo portal-halo-two" />
        <svg className="portal-core" fill="none" viewBox="0 0 760 760" xmlns="http://www.w3.org/2000/svg">
            <defs>
                <radialGradient id="portal-core-glow" cx="0" cy="0" gradientTransform="translate(378 378) rotate(90) scale(310)" gradientUnits="userSpaceOnUse" r="1">
                    <stop stopColor="#9347DD" stopOpacity=".24" />
                    <stop offset="1" stopColor="#2B0870" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="portal-orbit" x1="130" x2="630" y1="80" y2="650" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#9347DD" stopOpacity="0" />
                    <stop offset=".48" stopColor="#C9A7FF" stopOpacity=".8" />
                    <stop offset="1" stopColor="#6429AA" stopOpacity="0" />
                </linearGradient>
            </defs>
            <circle cx="380" cy="380" fill="url(#portal-core-glow)" r="325" />
            <circle className="portal-orbit portal-orbit-outer" cx="380" cy="380" r="278" stroke="url(#portal-orbit)" />
            <ellipse className="portal-orbit portal-orbit-one" cx="380" cy="380" rx="306" ry="128" stroke="url(#portal-orbit)" />
            <ellipse className="portal-orbit portal-orbit-two" cx="380" cy="380" rx="138" ry="310" stroke="url(#portal-orbit)" />
            <path d="M152 516C264 352 394 260 608 165" stroke="url(#portal-orbit)" strokeDasharray="2 13" />
            <path d="M178 238C344 336 495 418 635 538" stroke="url(#portal-orbit)" strokeDasharray="2 13" />
            <circle className="portal-node" cx="227" cy="264" fill="#9347DD" r="4" />
            <circle className="portal-node" cx="530" cy="201" fill="#C9A7FF" r="6" />
            <circle className="portal-node" cx="588" cy="468" fill="#9347DD" r="4" />
            <circle className="portal-node" cx="321" cy="578" fill="#C9A7FF" r="5" />
            <circle className="portal-node" cx="430" cy="336" fill="#F8F7FB" r="3" />
        </svg>
    </div>;
}

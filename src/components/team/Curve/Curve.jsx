"use client";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { text, curve, translate } from "@/motion";

const routes = {
	"/": "Home",
	"/services": "Services",
	"/presentation": "Our Work",
	"/ochi-team": "About Us",
	"/insights": "Insights",
	"/contact": "Contact Us",
	"/case": "Workiz Easy",
	"/o/team/introduction": "About Us",
};

const anim = (variants) => {
	return {
		variants,
		initial: "initial",
		animate: "enter",
		exit: "exit",
	};
};

export default function Curve({ children, backgroundColor }) {
	const pathname = usePathname();
	const [dimensions, setDimensions] = useState({
		width: null,
		height: null,
	});

	useEffect(() => {
		function resize() {
			setDimensions({
				width: window.innerWidth,
				height: window.innerHeight,
			});
		}
		resize();
		window.addEventListener("resize", resize);
		return () => {
			window.removeEventListener("resize", resize);
		};
	}, []);

	return (
		<div style={{ backgroundColor }}>
			<div
				style={{ opacity: dimensions.width == null ? 1 : 0 }}
				className="pointer-events-none fixed left-0 top-0 z-50 h-[calc(100vh+600px)] w-full bg-black"
			/>
			<motion.p
				className="absolute left-1/2 top-[40%] z-[60] -translate-x-1/2 text-center text-[50px] text-white"
				{...anim(text)}>
				{routes[pathname] ?? ""}
			</motion.p>
			{dimensions.width != null && <SVG {...dimensions} />}
			{children}
		</div>
	);
}

const SVG = ({ height, width }) => {
	const initialPath = `
        M0 300 
        Q${width / 2} 0 ${width} 300
        L${width} ${height + 300}
        Q${width / 2} ${height + 600} 0 ${height + 300}
        L0 0
    `;

	const targetPath = `
        M0 300
        Q${width / 2} 0 ${width} 300
        L${width} ${height}
        Q${width / 2} ${height} 0 ${height}
        L0 0
    `;

	return (
		<motion.svg
			className="pointer-events-none fixed left-0 top-0 z-50 h-[calc(100vh+600px)] w-full"
			{...anim(translate)}>
			<motion.path {...anim(curve(initialPath, targetPath))} />
		</motion.svg>
	);
};

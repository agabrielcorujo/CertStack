"use client";
import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════════════════
   THEMES — 4 premium palettes
════════════════════════════════════════════════════════ */
const THEMES = {

  // MILK — near-white canvas, cobalt blue accent. Clean, sharp, clinical luxury.
  // Like a high-end tech publication or an Apple product page.
  milk: {
    id: "milk", label: "Milk",
    bg: "#F7F7F8", bgSub: "#EEEFF1", bgCard: "#FFFFFF",
    border: "rgba(0,0,0,0.07)", borderStrong: "rgba(0,0,0,0.14)",
    shadow: "0 1px 2px rgba(0,0,0,0.05), 0 4px 14px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1)",
    shadowHov: "0 2px 6px rgba(0,0,0,0.07), 0 12px 28px rgba(0,0,0,0.09), inset 0 1px 0 rgba(255,255,255,1)",
    text: "#0A0A0B", textSub: "#52525B", textMuted: "#A1A1AA", textInverse: "#FFFFFF",
    accent: "#2563EB", accentText: "#FFFFFF",
    accentSoft: "rgba(37,99,235,0.07)", accentBorder: "rgba(37,99,235,0.18)",
    good: "#16A34A", goodSoft: "rgba(22,163,74,0.08)",
    warn: "#D97706", warnSoft: "rgba(217,119,6,0.08)",
    bad: "#DC2626", badSoft: "rgba(220,38,38,0.08)",
    s: ["#2563EB","#7C3AED","#16A34A","#0891B2","#D97706"],
    divider: "rgba(0,0,0,0.05)",
    navActive: "#2563EB", navActiveBg: "rgba(37,99,235,0.07)",
    navHov: "rgba(0,0,0,0.04)",
    inputBg: "rgba(0,0,0,0.03)",
    grain: "rgba(0,0,0,0.012)",
  },

  // MIDNIGHT — deep navy canvas. Electric lime accent. Like a Bloomberg terminal
  // reimagined by a luxury watch brand. Serious. Focused. Powerful.
  midnight: {
    id: "midnight", label: "Midnight",
    bg: "#0D1117", bgSub: "#161B22", bgCard: "#1C2128",
    border: "rgba(255,255,255,0.07)", borderStrong: "rgba(255,255,255,0.14)",
    shadow: "0 1px 3px rgba(0,0,0,0.5), 0 6px 20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
    shadowHov: "0 2px 8px rgba(0,0,0,0.6), 0 14px 36px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.07)",
    text: "#E6EDF3", textSub: "#7D8590", textMuted: "#30363D", textInverse: "#0D1117",
    accent: "#A3E635", accentText: "#0D1117",
    accentSoft: "rgba(163,230,53,0.1)", accentBorder: "rgba(163,230,53,0.22)",
    good: "#3FB950", goodSoft: "rgba(63,185,80,0.1)",
    warn: "#D29922", warnSoft: "rgba(210,153,34,0.1)",
    bad: "#F85149", badSoft: "rgba(248,81,73,0.1)",
    s: ["#A3E635","#58A6FF","#3FB950","#79C0FF","#D29922"],
    divider: "rgba(255,255,255,0.05)",
    navActive: "#A3E635", navActiveBg: "rgba(163,230,53,0.09)",
    navHov: "rgba(255,255,255,0.04)",
    inputBg: "rgba(255,255,255,0.04)",
    grain: "rgba(255,255,255,0.015)",
  },

  // EMBER — rich warm cream, deep amber-orange accent. Like candlelight through
  // parchment. Cozy but precise. Think Notion meets Hermès.
  ember: {
    id: "ember", label: "Ember",
    bg: "#FAF6F0", bgSub: "#F2EBE0", bgCard: "#FFFCF8",
    border: "rgba(120,80,30,0.1)", borderStrong: "rgba(120,80,30,0.2)",
    shadow: "0 1px 3px rgba(100,60,20,0.07), 0 4px 16px rgba(100,60,20,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
    shadowHov: "0 2px 8px rgba(100,60,20,0.1), 0 12px 30px rgba(100,60,20,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
    text: "#1A1209", textSub: "#6B5132", textMuted: "#C4A882", textInverse: "#FFFCF8",
    accent: "#C2410C", accentText: "#FFFFFF",
    accentSoft: "rgba(194,65,12,0.08)", accentBorder: "rgba(194,65,12,0.18)",
    good: "#15803D", goodSoft: "rgba(21,128,61,0.09)",
    warn: "#B45309", warnSoft: "rgba(180,83,9,0.09)",
    bad: "#B91C1C", badSoft: "rgba(185,28,28,0.09)",
    s: ["#C2410C","#7C2D12","#15803D","#0E7490","#B45309"],
    divider: "rgba(120,80,30,0.07)",
    navActive: "#C2410C", navActiveBg: "rgba(194,65,12,0.07)",
    navHov: "rgba(120,80,30,0.05)",
    inputBg: "rgba(120,80,30,0.04)",
    grain: "rgba(80,50,20,0.025)",
  },

  // SLATE — cool blue-grey canvas, hot coral accent. Like a Porsche Design
  // object — precise, engineered, with one flash of emotion.
  slate: {
    id: "slate", label: "Slate",
    bg: "#F1F3F5", bgSub: "#E8EAED", bgCard: "#FAFBFC",
    border: "rgba(60,70,90,0.1)", borderStrong: "rgba(60,70,90,0.2)",
    shadow: "0 1px 3px rgba(40,50,70,0.07), 0 4px 14px rgba(40,50,70,0.07), inset 0 1px 0 rgba(255,255,255,0.9)",
    shadowHov: "0 2px 8px rgba(40,50,70,0.1), 0 12px 28px rgba(40,50,70,0.1), inset 0 1px 0 rgba(255,255,255,0.95)",
    text: "#0F1621", textSub: "#4A5568", textMuted: "#A0ABBE", textInverse: "#FAFBFC",
    accent: "#F43F5E", accentText: "#FFFFFF",
    accentSoft: "rgba(244,63,94,0.07)", accentBorder: "rgba(244,63,94,0.18)",
    good: "#059669", goodSoft: "rgba(5,150,105,0.08)",
    warn: "#D97706", warnSoft: "rgba(217,119,6,0.08)",
    bad: "#E11D48", badSoft: "rgba(225,29,72,0.08)",
    s: ["#F43F5E","#6366F1","#059669","#0EA5E9","#D97706"],
    divider: "rgba(60,70,90,0.06)",
    navActive: "#F43F5E", navActiveBg: "rgba(244,63,94,0.07)",
    navHov: "rgba(60,70,90,0.05)",
    inputBg: "rgba(60,70,90,0.04)",
    grain: "rgba(40,50,70,0.02)",
  },
};

/* ════════════════════════════════════════════════════════
   DATA
════════════════════════════════════════════════════════ */
const SUBJECTS = [
  { name: "Cloud Computing", abbr: "CC", pct: 78, questions: 620, color: 0 },
  { name: "Cybersecurity", abbr: "CS", pct: 62, questions: 210, color: 1 },
  { name: "DevOps & CI/CD", abbr: "DO", pct: 55, questions: 280, color: 2 },
  { name: "System Design", abbr: "SD", pct: 83, questions: 340, color: 3 },
  { name: "Networking", abbr: "NT", pct: 48, questions: 310, color: 4 },
];

const CARDS = [
  { q: "What is the CAP theorem in distributed systems?", a: "CAP theorem states that a distributed system can only guarantee two of three properties: Consistency, Availability, and Partition tolerance. Understanding trade-offs is essential for system design.", sub: "System Design" },
  { q: "What is the difference between symmetric and asymmetric encryption?", a: "Symmetric encryption uses the same key for encryption and decryption (e.g., AES), while asymmetric uses public/private key pairs (e.g., RSA). Symmetric is faster but requires secure key exchange.", sub: "Cybersecurity" },
  { q: "What is a VPC in AWS?", a: "VPC (Virtual Private Cloud) is an isolated virtual network within AWS where you can launch resources. It provides control over IP ranges, subnets, route tables, and gateways for network architecture.", sub: "Cloud Computing" },
  { q: "Explain the OSI model layers.", a: "The OSI model has 7 layers: Physical, Data Link, Network, Transport, Session, Presentation, and Application. Each layer provides specific network communication functions.", sub: "Networking" },
  { q: "What is continuous integration vs continuous deployment?", a: "CI automatically builds and tests code changes. CD extends CI by automatically deploying to production after passing tests. Together they enable rapid, reliable software delivery.", sub: "DevOps" },
];

const EXAM_LIST = [
  { name: "AWS Solutions Architect", date: "Mar 15", days: 16, sub: 0 },
  { name: "CompTIA Security+", date: "Mar 22", days: 23, sub: 1 },
  { name: "Kubernetes CKA", date: "Apr 1", days: 33, sub: 2 },
  { name: "Cisco CCNA", date: "Mar 28", days: 29, sub: 4 },
];

const QUIZZES = [
  {
    subject: "Cloud Computing",
    title: "AWS Core Services",
    questions: [
      { q: "Which AWS service is used for object storage?", choices: ["EC2","S3","RDS","Lambda"], answer: 1, explain: "Amazon S3 (Simple Storage Service) is AWS's object storage service, offering scalability, data availability, security, and performance." },
      { q: "What is the purpose of AWS IAM?", choices: ["Compute instances","Identity & access management","Database service","Content delivery"], answer: 1, explain: "IAM (Identity and Access Management) controls access to AWS resources through users, groups, roles, and policies." },
      { q: "Which service provides serverless compute?", choices: ["EC2","ECS","Lambda","Lightsail"], answer: 2, explain: "AWS Lambda lets you run code without provisioning servers. You only pay for compute time consumed." },
    ],
    color: 2,
  },
  {
    subject: "Networking",
    title: "TCP/IP Fundamentals",
    questions: [
      { q: "Which layer does TCP operate at in the OSI model?", choices: ["Network","Transport","Application","Data Link"], answer: 1, explain: "TCP operates at the Transport layer (Layer 4), providing reliable, ordered delivery of data packets." },
      { q: "What is the default subnet mask for a Class C network?", choices: ["255.0.0.0","255.255.0.0","255.255.255.0","255.255.255.255"], answer: 2, explain: "Class C networks use 255.255.255.0 (/24), providing 254 usable host addresses per network." },
    ],
    color: 3,
  },
];

/* ════════════════════════════════════════════════════════
   SVG ICON SYSTEM — bespoke geometric icons, no library
════════════════════════════════════════════════════════ */
function Icon({ name, size = 16, color = "currentColor", strokeWidth = 1.6 }) {
  const p = { fill: "none", stroke: color, strokeWidth, strokeLinecap: "round", strokeLinejoin: "round" };
  const icons = {
    // Nav icons — geometric, distinctive
    home: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M3 9.5L10 3l7 6.5V17a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M7.5 18V12h5v6"/></svg>,
    grid: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><rect x="3" y="3" width="6" height="6" rx="1.5"/><rect x="11" y="3" width="6" height="6" rx="1.5"/><rect x="3" y="11" width="6" height="6" rx="1.5"/><rect x="11" y="11" width="6" height="6" rx="1.5"/></svg>,
    cards: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><rect x="3" y="5" width="14" height="12" rx="2"/><path d="M6 5V4a1 1 0 011-1h6a1 1 0 011 1v1"/><path d="M7 10h6M7 13h4"/></svg>,
    calendar: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><rect x="3" y="4" width="14" height="14" rx="2"/><path d="M3 8h14M7 3v2M13 3v2"/><circle cx="7" cy="12" r="1" fill={color}/><circle cx="10" cy="12" r="1" fill={color}/><circle cx="13" cy="12" r="1" fill={color}/></svg>,
    trophy: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 14c-3.3 0-6-2.7-6-6V4h12v4c0 3.3-2.7 6-6 6z"/><path d="M4 6H2.5A1.5 1.5 0 001 7.5v.5a3 3 0 003 3M16 6h1.5A1.5 1.5 0 0119 7.5v.5a3 3 0 01-3 3"/><path d="M10 14v3M7 17h6"/></svg>,
    quiz: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M4 3h12a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4a1 1 0 011-1z"/><circle cx="8" cy="8.5" r="1.5"/><path d="M11.5 7h3M11.5 10h3M5.5 13h9"/></svg>,
    gear: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><circle cx="10" cy="10" r="3"/><path d="M10 3v1.5M10 15.5V17M3 10h1.5M15.5 10H17M5.05 5.05l1.06 1.06M13.89 13.89l1.06 1.06M5.05 14.95l1.06-1.06M13.89 6.11l1.06-1.06"/></svg>,
    // Feature icons
    bell: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 3a5 5 0 00-5 5v3l-1.5 2.5h13L15 11V8a5 5 0 00-5-5z"/><path d="M8.5 16.5a1.5 1.5 0 003 0"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><circle cx="8.5" cy="8.5" r="5.5"/><path d="M17 17l-3.5-3.5"/></svg>,
    palette: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><circle cx="10" cy="10" r="7"/><circle cx="7" cy="8" r="1.2" fill={color} stroke="none"/><circle cx="13" cy="8" r="1.2" fill={color} stroke="none"/><circle cx="8" cy="13" r="1.2" fill={color} stroke="none"/><circle cx="13" cy="12.5" r="1.2" fill={color} stroke="none"/></svg>,
    arrow: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M4 10h12M12 6l4 4-4 4"/></svg>,
    arrowup: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 16V4M6 8l4-4 4 4"/></svg>,
    check: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M4 10l5 5 7-8"/></svg>,
    close: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M5 5l10 10M15 5L5 15"/></svg>,
    flame: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 17c-3.3 0-6-2.3-6-6 0-2 1-4 2.5-5.5C7 8 8 8.5 8 8.5S8 6 10 3c0 0 2 3.5 5 5 .8 1 1.5 2.5 1.5 4 0 2.8-2.3 5-6.5 5z"/><path d="M10 17c-1.5 0-2.5-1-2.5-2.5 0-1 .5-2 1.5-2.5 0 1 1 1.5 1 1.5s0-1 1-2c0 0 1 1.5 1 3 0 1-.5 2.5-2 2.5z"/></svg>,
    brain: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 4c-1 0-2 .5-2.5 1.5C5.5 5.5 4 7 4 9c0 1 .5 2 1 2.5-.5.8-.5 2.5 1 3 .5 1.5 2 2.5 4 2.5s3.5-1 4-2.5c1.5-.5 1.5-2.2 1-3 .5-.5 1-1.5 1-2.5 0-2-1.5-3.5-3.5-3.5C12 4.5 11 4 10 4z"/><path d="M10 4v13M7 8.5c1 0 2 1 2 2M13 8.5c-1 0-2 1-2 2"/></svg>,
    user: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><circle cx="10" cy="7" r="3"/><path d="M4 18c0-3.3 2.7-6 6-6s6 2.7 6 6"/></svg>,
    robot: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><rect x="3" y="8" width="14" height="9" rx="2"/><rect x="7" y="11" width="2" height="2" rx="0.5" fill={color} stroke="none"/><rect x="11" y="11" width="2" height="2" rx="0.5" fill={color} stroke="none"/><path d="M7.5 15.5h5M10 8V5M8 5h4"/><circle cx="10" cy="4" r="1"/></svg>,
    send: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M17 3L3 9l6 2 2 6 6-14z"/><path d="M9 11l3-3"/></svg>,
    sparkle: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 3l1.5 4.5L16 9l-4.5 1.5L10 15l-1.5-4.5L4 9l4.5-1.5L10 3z"/><path d="M16 2l.7 2L19 5l-2.3.7L16 8l-.7-2.3L13 5l2.3-.7L16 2zM5 14l.5 1.5L7 16l-1.5.5L5 18l-.5-1.5L3 16l1.5-.5L5 14z"/></svg>,
    book: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M4 4a2 2 0 012-2h8a2 2 0 012 2v13l-6-3-6 3V4z"/><path d="M8 7h4M8 10h2"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M8 4H5a1 1 0 00-1 1v10a1 1 0 001 1h3M13 14l4-4-4-4M17 10H9"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M14 3l3 3L7 16l-4 1 1-4L14 3z"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z"/><circle cx="10" cy="10" r="2.5"/></svg>,
    lock: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><rect x="4" y="9" width="12" height="9" rx="2"/><path d="M7 9V7a3 3 0 016 0v2"/><circle cx="10" cy="13.5" r="1.5" fill={color} stroke="none"/></svg>,
    mail: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><rect x="2" y="5" width="16" height="12" rx="2"/><path d="M2 7l8 5 8-5"/></svg>,
    target: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><circle cx="10" cy="10" r="7"/><circle cx="10" cy="10" r="4"/><circle cx="10" cy="10" r="1.5" fill={color} stroke="none"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 14V4M6 8l4-4 4 4M5 17h10"/></svg>,
    lightning: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M11.5 3L6 11h5.5L8.5 17 15 8.5h-5L11.5 3z" fill={color} stroke="none" opacity="0.2"/><path d="M11.5 3L6 11h5.5L8.5 17 15 8.5h-5L11.5 3z"/></svg>,
    star: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M10 3l2 5h5l-4 3 1.5 5.5L10 13.5 5.5 16.5 7 11 3 8h5L10 3z" fill={color} stroke="none" opacity="0.25"/><path d="M10 3l2 5h5l-4 3 1.5 5.5L10 13.5 5.5 16.5 7 11 3 8h5L10 3z"/></svg>,
    clock: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/></svg>,
    xp: <svg width={size} height={size} viewBox="0 0 20 20" {...p}><path d="M5 5l5 5-5 5M15 5l-5 5 5 5"/></svg>,
  };
  return icons[name] || null;
}

/* ════════════════════════════════════════════════════════
   GLOBAL STYLES
════════════════════════════════════════════════════════ */
function G({ t }) {
  return <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&family=DM+Mono:wght@400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; }
    body {
      font-family: 'DM Sans', -apple-system, sans-serif; font-size: 14px; font-weight: 400; line-height: 1.5;
      background: ${t.bg};
      color: ${t.text};
      height: 100%;
      -webkit-font-smoothing: antialiased;
    }
    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: ${t.border}; border-radius: 99px; }
    button { font-family: inherit; cursor: pointer; border: none; background: none; }
    input, textarea, select { font-family: inherit; }
    :focus-visible { outline: 2px solid ${t.accent}55; outline-offset: 3px; border-radius: 6px; }

    /* LOADER */
    @keyframes breathe { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.06);opacity:0.7} }
    @keyframes barload { 0%{width:0} 15%{width:12%} 40%{width:44%} 70%{width:70%} 90%{width:88%} 100%{width:100%} }
    @keyframes fadeaway { to{opacity:0;pointer-events:none} }
    @keyframes loaderMsg { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    .breath { animation: breathe 2.6s ease-in-out infinite; }
    .bar-anim { animation: barload 2.2s cubic-bezier(.4,0,.2,1) forwards; }
    .fade-out { animation: fadeaway 0.5s ease 0.1s forwards; }
    .loader-msg { animation: loaderMsg 0.3s ease both; }
    .loader-dot { animation: breathe 1.4s ease-in-out infinite; }
    .loader-dot:nth-child(2) { animation-delay: 0.2s; }
    .loader-dot:nth-child(3) { animation-delay: 0.4s; }

    /* ENTRANCES */
    @keyframes up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @keyframes inLeft { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:none} }
    @keyframes curtain { from{clip-path:inset(0 100% 0 0)} to{clip-path:inset(0 0% 0 0)} }
    @keyframes pop { from{opacity:0;transform:scale(0.9) translateY(14px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes floatIn { from{opacity:0;transform:translateY(-8px) scale(0.97)} to{opacity:1;transform:none} }

    /* FLIP CARD */
    .flip-root { perspective: 1100px; }
    .flip-inner { transform-style:preserve-3d; transition:transform 0.75s cubic-bezier(.4,.2,.2,1); position:relative; width:100%; height:100%; }
    .flip-inner.flipped { transform:rotateY(180deg); }
    .flip-face { position:absolute; inset:0; backface-visibility:hidden; border-radius:20px; }
    .flip-back { transform:rotateY(180deg); }

    /* MISC */
    @keyframes glow { 0%,100%{opacity:0.5} 50%{opacity:1} }
    @keyframes flameLick { 0%,100%{transform:scale(1) rotate(-2deg)} 33%{transform:scale(1.08) rotate(2deg)} 66%{transform:scale(0.94) rotate(-1deg)} }
    .flame { animation: flameLick 2s ease-in-out infinite; display:inline-block; transform-origin: bottom center; }
    .press { transition: transform 150ms cubic-bezier(.34,1.4,.64,1) !important; }
    .press:active { transform: scale(0.95) !important; }
    .lift { transition: transform 280ms cubic-bezier(.34,1.4,.64,1), box-shadow 280ms ease; }
    .lift:hover { transform: translateY(-3px) !important; }

    /* PROGRESS */
    @keyframes growBar { from{transform:scaleX(0)} to{transform:scaleX(1)} }
    .bar-grow { transform-origin:left; animation:growBar 900ms cubic-bezier(.16,1,.3,1) both; }

    /* CHART */
    @keyframes drawLine { from{stroke-dashoffset:800} to{stroke-dashoffset:0} }
    .chart-line { stroke-dasharray:800; animation:drawLine 1.6s cubic-bezier(.16,1,.3,1) 0.2s both; }

    /* PALETTE */
    @keyframes paletteDrop { from{opacity:0;transform:translateY(-12px) scale(0.96)} to{opacity:1;transform:none} }
    .palette-in { animation: paletteDrop 0.22s cubic-bezier(.34,1.3,.64,1) both; }

    /* THEME TRANSITION */
    .theme-root { transition: background 0.4s ease, color 0.4s ease; }

    /* PULSE DOT */
    @keyframes pulseDot { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.5);opacity:0.5} }
    .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

    /* LANDING */
    @keyframes heroSlide { from{opacity:0;transform:translateY(32px)} to{opacity:1;transform:none} }
    @keyframes heroSubtitle { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    @keyframes heroCta { from{opacity:0;transform:translateY(16px) scale(0.97)} to{opacity:1;transform:none} }
    @keyframes float { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-8px)} }
    .float-card { animation: float 5s ease-in-out infinite; }
    .float-card-delay { animation: float 5s ease-in-out 1.5s infinite; }

    /* SHINE */
    @keyframes shine { 0%{left:-60%} 100%{left:120%} }
    .shine-parent { overflow:hidden; position:relative; }
    .shine-parent::after {
      content:'';position:absolute;top:0;left:-60%;width:40%;height:100%;
      background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);
      animation:shine 3.5s ease-in-out 1s infinite;
    }

    /* NOTIFICATION */
    @keyframes notifSlide { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:none} }
    .notif-panel { animation: notifSlide 0.25s cubic-bezier(.34,1.3,.64,1) both; }

    /* QUIZ */
    @keyframes correctFlash { 0%,100%{} 40%{background:rgba(78,126,80,0.2)} }
    @keyframes wrongFlash { 0%,100%{} 40%{background:rgba(168,56,56,0.2)} }
    .correct-flash { animation: correctFlash 0.6s ease both; }
    .wrong-flash { animation: wrongFlash 0.6s ease both; }

    /* CHAT */
    @keyframes chatIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
    .chat-in { animation: chatIn 0.3s ease both; }
    @keyframes typingPulse { 0%,80%,100%{transform:scale(0)} 40%{transform:scale(1)} }
    .typing-dot { animation: typingPulse 1.4s ease-in-out infinite; }
    .typing-dot:nth-child(1) { animation-delay: 0s; }
    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .typing-dot:nth-child(3) { animation-delay: 0.4s; }

    /* LANDING FEATURE CARDS */
    @keyframes cardReveal { from{opacity:0;transform:translateY(24px) scale(0.97)} to{opacity:1;transform:none} }
    .feat-card { animation: cardReveal 0.5s ease both; }

    /* AUTH */
    @keyframes authIn { from{opacity:0;transform:scale(0.94) translateY(24px)} to{opacity:1;transform:none} }
    .auth-panel { animation: authIn 0.5s cubic-bezier(.34,1.2,.64,1) both; }

    /* SPEED ROUND */
    @keyframes shakeNo { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
    @keyframes streakBurst { 0%{transform:scale(1)} 50%{transform:scale(1.3)} 100%{transform:scale(1)} }
    @keyframes xpFloat { from{opacity:1;transform:translateY(0) scale(1)} to{opacity:0;transform:translateY(-50px) scale(0.8)} }
    .shake-no { animation: shakeNo 0.4s ease both; }
    .streak-burst { animation: streakBurst 0.4s cubic-bezier(.34,1.6,.64,1) both; }
    .xp-float { animation: xpFloat 1.2s ease-out forwards; pointer-events:none; }
  `}</style>;
}



/* ════════════════════════════════════════════════════════
   CARD BASE
════════════════════════════════════════════════════════ */
function Card({ t, s = {}, children, onClick, className = "" }) {
  const base = {
    background: t.bgCard,
    border: `1px solid ${t.border}`,
    borderRadius: 16,
    boxShadow: t.shadow,
    transition: "box-shadow 250ms ease, transform 250ms ease, border-color 250ms ease",
    ...(onClick ? { cursor: "pointer" } : {}),
    ...s,
  };
  return (
    <div style={base} className={className}
      onClick={onClick}
      onMouseEnter={onClick ? e => {
        e.currentTarget.style.boxShadow = t.shadowHov;
        e.currentTarget.style.borderColor = t.borderStrong;
        e.currentTarget.style.transform = "translateY(-2px)";
      } : undefined}
      onMouseLeave={onClick ? e => {
        e.currentTarget.style.boxShadow = t.shadow;
        e.currentTarget.style.borderColor = t.border;
        e.currentTarget.style.transform = "none";
      } : undefined}
    >
      {children}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   LOADER
════════════════════════════════════════════════════════ */
const LOADER_MSGS = [
  "Loading your progress…",
  "Fetching exam schedule…",
  "Preparing flashcard deck…",
  "Ready.",
];

function Loader({ t, exiting }) {
  const [msgIdx, setMsgIdx] = useState(0);
  useEffect(() => {
    const ts = LOADER_MSGS.map((_, i) => setTimeout(() => setMsgIdx(i), i * 550));
    return () => ts.forEach(clearTimeout);
  }, []);

  return (
    <div className={exiting ? "fade-out" : ""} style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: t.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", gap: 40,
    }}>
      {/* Logo mark */}
      <div className="breath" style={{ textAlign: "center" }}>
        {/* Geometric monogram */}
        <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <rect x="4" y="4" width="44" height="44" rx="14" fill={t.accentSoft} stroke={t.accentBorder} strokeWidth="1.5"/>
            <rect x="11" y="25" width="30" height="17" rx="4" fill={t.accent} opacity="0.18"/>
            <rect x="11" y="19" width="30" height="17" rx="4" fill={t.accent} opacity="0.38"/>
            <rect x="11" y="13" width="30" height="17" rx="4" fill={t.accent}/>
            <path d="M20 22l4 4 8-6" stroke={t.accentText} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{
          fontFamily: "'Instrument Serif', Georgia, serif",
          fontSize: 44, fontWeight: 400, letterSpacing: "-0.03em",
          color: t.text, fontStyle: "italic", lineHeight: 1,
        }}>
          Cert<span style={{ color: t.accent }}>Stack</span>
        </div>
        <div style={{
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 10, letterSpacing: "0.28em", color: t.textSub,
          marginTop: 7, textTransform: "uppercase", fontWeight: 600,
        }}>Certification Platform</div>
      </div>

      {/* Animated bar + message */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <div style={{ width: 220, height: 2, background: t.bgSub, borderRadius: 99, overflow: "hidden" }}>
          <div className="bar-anim" style={{ height: "100%", background: t.accent, borderRadius: 99 }} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span key={msgIdx} className="loader-msg" style={{
            fontSize: 11, color: t.textMuted,
            fontFamily: "'DM Mono', monospace", letterSpacing: "0.04em",
          }}>{LOADER_MSGS[msgIdx]}</span>
          <span style={{ display: "flex", gap: 3 }}>
            {[0,1,2].map(i => (
              <span key={i} className="loader-dot" style={{
                width: 3, height: 3, borderRadius: "50%",
                background: t.textMuted, display: "inline-block",
                animationDelay: `${i * 0.18}s`,
              }} />
            ))}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   NAV CONFIG — bespoke geometric icons
════════════════════════════════════════════════════════ */
const NAV = [
  { id: "dashboard", icon: "home", title: "Dashboard" },
  { id: "subjects",  icon: "cards", title: "Study" },
  { id: "quiz",      icon: "quiz", title: "Practice" },
  { id: "exams",     icon: "calendar", title: "Exams" },
];

/* ════════════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════════════ */
function Sidebar({ t, active, setActive, vis }) {
  return (
    <nav style={{
      width: 62, flexShrink: 0,
      background: t.bg,
      borderRight: `1px solid ${t.border}`,
      display: "flex", flexDirection: "column", alignItems: "center",
      padding: "16px 0 12px",
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateX(-24px)",
      transition: "opacity 0.4s ease, transform 0.5s cubic-bezier(.34,1.2,.64,1)",
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 22, width: 34, height: 34, borderRadius: 10,
        background: t.accentSoft, border: `1px solid ${t.accentBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
          <rect x="3" y="8" width="14" height="9" rx="2.5" fill={t.accent} opacity="0.15"/>
          <rect x="3" y="5" width="14" height="9" rx="2.5" fill={t.accent} opacity="0.3"/>
          <rect x="3" y="2" width="14" height="9" rx="2.5" fill={t.accent}/>
          <path d="M7 7l2 2 4-3.5" stroke={t.accentText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>

      {/* Nav items */}
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {NAV.map((item, i) => {
          const isActive = active === item.id;
          return (
            <button key={item.id} onClick={() => setActive(item.id)}
              title={item.title}
              className="press"
              style={{
                width: 40, height: 40, borderRadius: 11,
                background: isActive ? t.navActiveBg : "transparent",
                color: isActive ? t.navActive : t.textMuted,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 200ms ease",
                animation: vis ? `inLeft 0.4s ease ${0.05 + i * 0.05}s both` : "none",
                position: "relative",
              }}
              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = t.navHov; e.currentTarget.style.color = t.textSub; }}}
              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}}
            >
              <Icon name={item.icon} size={17} color="currentColor" />
              {isActive && (
                <span style={{
                  position: "absolute", right: -1, top: "50%", transform: "translateY(-50%)",
                  width: 3, height: 20, borderRadius: "2px 0 0 2px",
                  background: t.navActive,
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Settings at bottom */}
      <button onClick={() => setActive("settings")} title="Settings"
        className="press"
        style={{
          width: 40, height: 40, borderRadius: 11,
          background: active === "settings" ? t.navActiveBg : "transparent",
          color: active === "settings" ? t.navActive : t.textMuted,
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 200ms ease",
        }}
        onMouseEnter={e => { if (active !== "settings") { e.currentTarget.style.background = t.navHov; e.currentTarget.style.color = t.textSub; }}}
        onMouseLeave={e => { if (active !== "settings") { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = t.textMuted; }}}
      >
        <Icon name="gear" size={17} />
      </button>
    </nav>
  );
}

/* ════════════════════════════════════════════════════════
   TOPBAR
════════════════════════════════════════════════════════ */
function Topbar({ t, page, onSearch, vis, themeId, setThemeId, setPage }) {
  const [showThemes, setShowThemes] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const PAGE_LABELS = {
    dashboard: "Dashboard", subjects: "Study Materials", study: "Flashcards",
    quiz: "Practice", exams: "Exam Schedule", settings: "Settings", speed: "Speed Round",
  };
  const NOTIFS = [
    { text: "AWS Solutions Architect exam in 16 days", sub: "Exam reminder", time: "now", urgent: true },
    { text: "New quiz available: Cloud Computing", sub: "Content update", time: "1d", urgent: false },
  ];

  return (
    <div style={{
      height: 54, borderBottom: `1px solid ${t.border}`,
      display: "flex", alignItems: "center", padding: "0 20px",
      gap: 12, background: t.bg,
      opacity: vis ? 1 : 0,
      transform: vis ? "none" : "translateY(-12px)",
      transition: "opacity 0.4s ease, transform 0.4s ease",
    }}>
      {/* Page label */}
      <div style={{ flex: 1 }}>
        <span style={{
          fontSize: 13, fontWeight: 700, color: t.text,
          letterSpacing: "-0.01em",
        }}>{PAGE_LABELS[page] || page}</span>
      </div>

      {/* Search */}
      <button onClick={onSearch} className="press" style={{
        display: "flex", alignItems: "center", gap: 8,
        height: 32, padding: "0 12px",
        borderRadius: 9, border: `1px solid ${t.border}`,
        background: t.inputBg, color: t.textSub, fontSize: 12,
        transition: "all 160ms",
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = t.borderStrong; e.currentTarget.style.background = t.bgSub; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.inputBg; }}
      >
        <Icon name="search" size={13} />
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: t.textMuted }}>⌘K</span>
      </button>

      {/* Theme picker */}
      <div style={{ position: "relative" }}>
        <button className="press" onClick={() => { setShowThemes(p => !p); setShowNotifs(false); }} style={{
          width: 32, height: 32, borderRadius: 9,
          border: `1px solid ${t.border}`,
          background: t.inputBg, display: "flex", alignItems: "center", justifyContent: "center",
          color: t.textSub, transition: "all 160ms",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = t.bgSub; }}
          onMouseLeave={e => { e.currentTarget.style.background = t.inputBg; }}
        >
          <Icon name="palette" size={14} />
        </button>
        {showThemes && (
          <div className="palette-in" style={{
            position: "absolute", top: 38, right: 0,
            background: t.bgCard, border: `1px solid ${t.borderStrong}`,
            borderRadius: 14, padding: 10,
            boxShadow: t.shadowHov, zIndex: 200,
            display: "flex", flexDirection: "column", gap: 6,
          }}>
            {Object.values(THEMES).map(th => (
              <button key={th.id} className="press" onClick={() => { setThemeId(th.id); setShowThemes(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "8px 10px", borderRadius: 9, cursor: "pointer",
                  border: themeId === th.id ? `1.5px solid ${t.text}` : `1.5px solid ${t.border}`,
                  background: th.bgCard, width: 140,
                  transition: "border-color 150ms",
                }}>
                <div style={{ width: 24, height: 18, borderRadius: 5,
                  background: th.bg, border: `1px solid ${th.border}`, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: th.accent }} />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: th.text }}>{th.label}</span>
                {themeId === th.id && (
                  <div style={{ marginLeft: "auto", color: t.accent }}>
                    <Icon name="check" size={12} color={t.accent} />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notifications */}
      <div style={{ position: "relative" }}>
        <button className="press" onClick={() => { setShowNotifs(p => !p); setShowThemes(false); }} style={{
          width: 32, height: 32, borderRadius: 9,
          border: `1px solid ${t.border}`,
          background: t.inputBg, position: "relative",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: t.textSub, transition: "all 160ms",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = t.bgSub; }}
          onMouseLeave={e => { e.currentTarget.style.background = t.inputBg; }}
        >
          <Icon name="bell" size={14} />
          <span className="pulse-dot" style={{
            position: "absolute", top: 6, right: 6,
            width: 6, height: 6, borderRadius: "50%",
            background: t.bad, border: `1.5px solid ${t.bg}`,
          }} />
        </button>
        {showNotifs && (
          <div className="notif-panel" style={{
            position: "absolute", top: 38, right: 0, width: 280,
            background: t.bgCard, border: `1px solid ${t.borderStrong}`,
            borderRadius: 14, boxShadow: t.shadowHov, zIndex: 200, overflow: "hidden",
          }}>
            <div style={{ padding: "12px 16px 8px", borderBottom: `1px solid ${t.border}` }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: t.text }}>Notifications</p>
            </div>
            {NOTIFS.map((n, i) => (
              <div key={i} style={{
                padding: "11px 16px",
                borderBottom: i < NOTIFS.length - 1 ? `1px solid ${t.divider}` : "none",
                background: n.urgent ? t.badSoft : "transparent",
                cursor: "pointer", transition: "background 120ms",
              }}
                onMouseEnter={e => e.currentTarget.style.background = t.bgSub}
                onMouseLeave={e => e.currentTarget.style.background = n.urgent ? t.badSoft : "transparent"}
              >
                <p style={{ fontSize: 12, fontWeight: 600, color: t.text, marginBottom: 2 }}>{n.text}</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <p style={{ fontSize: 10, color: t.textSub, fontFamily: "'DM Mono', monospace" }}>{n.sub}</p>
                  <p style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>{n.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Avatar */}
      <button className="press" onClick={() => setPage("settings")} style={{
        background: "none", border: "none", padding: 0, cursor: "pointer",
      }}>
        <img
          src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=64&h=64&fit=crop&crop=faces&auto=format&q=80"
          alt="Alex"
          style={{
            width: 32, height: 32, borderRadius: "50%", objectFit: "cover",
            border: `2px solid ${t.accentBorder}`,
            display: "block",
          }}
        />
      </button>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   COMMAND PALETTE
════════════════════════════════════════════════════════ */
function Palette({ t, onClose, setPage }) {
  const [q, setQ] = useState("");
  const ref = useRef();
  useEffect(() => { ref.current?.focus(); }, []);

  const items = [
    { label: "Dashboard", id: "dashboard", icon: "home" },
    { label: "Subjects", id: "subjects", icon: "grid" },
    { label: "Flashcards", id: "study", icon: "cards" },
    { label: "Quizzes", id: "quiz", icon: "quiz" },
    { label: "Speed Round", id: "speed", icon: "lightning" },
    { label: "Exams", id: "exams", icon: "calendar" },
    { label: "Settings", id: "settings", icon: "gear" },
  ].filter(i => !q || i.label.toLowerCase().includes(q.toLowerCase()));

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(8px)",
      zIndex: 500, display: "flex", alignItems: "flex-start",
      justifyContent: "center", paddingTop: "14vh",
    }}>
      <div className="palette-in" onClick={e => e.stopPropagation()} style={{
        width: 500, background: t.bgCard,
        border: `1px solid ${t.borderStrong}`,
        borderRadius: 18, overflow: "hidden",
        boxShadow: t.shadowHov,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "14px 16px",
          borderBottom: `1px solid ${t.border}` }}>
          <Icon name="search" size={14} color={t.textMuted} />
          <input ref={ref} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Jump to…" style={{
              flex: 1, background: "none", border: "none", outline: "none",
              fontSize: 15, color: t.text, fontFamily: "'DM Sans', sans-serif",
            }} />
          <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace",
            background: t.bgSub, padding: "2px 6px", borderRadius: 5 }}>ESC</span>
        </div>
        <div style={{ padding: "6px" }}>
          {items.map((item, i) => (
            <button key={i} onClick={() => { setPage(item.id); onClose(); }} style={{
              width: "100%", textAlign: "left", display: "flex", alignItems: "center",
              gap: 12, padding: "10px 12px", borderRadius: 10, fontSize: 14,
              color: t.text, fontWeight: 600, transition: "background 100ms",
            }}
              onMouseEnter={e => e.currentTarget.style.background = t.bgSub}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ color: t.accent }}><Icon name={item.icon} size={15} color={t.accent} /></span>
              {item.label}
              <span style={{ marginLeft: "auto" }}>
                <Icon name="arrow" size={13} color={t.textMuted} />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   CHART
════════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════
   AI CHAT HELPER (used in flashcards + quizzes)
════════════════════════════════════════════════════════ */
function AiChat({ t, context }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: `I'm your study assistant. Ask me anything about ${context || "this topic"}!` },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef();

  const RESPONSES = {
    default: [
      "Great question! This is a foundational concept. The key thing to remember is the relationship between the components — try building a mental map linking cause to effect.",
      "Think of it this way: imagine you're explaining this to someone unfamiliar with the topic. What would you say first? That usually reveals what you actually understand vs. what you've memorized.",
      "A mnemonic that helps here: connect the first letters of the key terms. Write it out once, then cover it and try again — spaced repetition is proven to stick.",
      "The tricky part here is distinguishing this from similar concepts. Focus on the defining characteristic — it's usually the one thing that makes this case unique.",
    ],
  };

  const send = () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setLoading(true);
    setTimeout(() => {
      const resp = RESPONSES.default[Math.floor(Math.random() * RESPONSES.default.length)];
      setMessages(m => [...m, { role: "ai", text: resp }]);
      setLoading(false);
    }, 1200 + Math.random() * 600);
  };

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  return (
    <Card t={t} s={{ display: "flex", flexDirection: "column", height: 280, overflow: "hidden" }}>
      {/* Header */}
      <div style={{ padding: "12px 16px 10px", borderBottom: `1px solid ${t.border}`,
        display: "flex", alignItems: "center", gap: 9 }}>
        <div style={{ width: 28, height: 28, borderRadius: 8,
          background: t.accentSoft, border: `1px solid ${t.accentBorder}`,
          display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="robot" size={14} color={t.accent} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 700, color: t.text }}>Study AI</p>
          <p style={{ fontSize: 9, color: t.good, fontFamily: "'DM Mono', monospace", display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: t.good, display: "inline-block" }} />
            Online
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: "auto", padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {messages.map((msg, i) => (
          <div key={i} className="chat-in" style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "82%", padding: "8px 12px", borderRadius: msg.role === "user" ? "12px 12px 3px 12px" : "12px 12px 12px 3px",
              background: msg.role === "user" ? t.accent : t.bgSub,
              color: msg.role === "user" ? t.accentText : t.text,
              fontSize: 12, lineHeight: 1.5, fontWeight: 400,
            }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-in" style={{ display: "flex", justifyContent: "flex-start" }}>
            <div style={{ padding: "10px 14px", borderRadius: "12px 12px 12px 3px",
              background: t.bgSub, display: "flex", gap: 4, alignItems: "center" }}>
              {[0,1,2].map(i => (
                <span key={i} className="typing-dot" style={{
                  width: 5, height: 5, borderRadius: "50%", background: t.textMuted, display: "inline-block" }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div style={{ padding: "10px 14px", borderTop: `1px solid ${t.border}`,
        display: "flex", gap: 8, alignItems: "center" }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="Ask anything…"
          style={{
            flex: 1, background: t.inputBg, border: `1px solid ${t.border}`,
            borderRadius: 8, padding: "6px 10px", fontSize: 12, color: t.text,
            outline: "none", transition: "border-color 150ms",
          }}
          onFocus={e => e.target.style.borderColor = t.accentBorder}
          onBlur={e => e.target.style.borderColor = t.border}
        />
        <button className="press" onClick={send} style={{
          width: 30, height: 30, borderRadius: 8,
          background: t.accent, color: t.accentText,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon name="send" size={13} color={t.accentText} />
        </button>
      </div>
    </Card>
  );
}

/* ════════════════════════════════════════════════════════
   DASHBOARD PAGE
════════════════════════════════════════════════════════ */
function DashboardPage({ t, vis, setPage }) {
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24, animation: vis ? "up 0.5s ease 0.05s both" : "none" }}>
        <p style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace",
          letterSpacing: "0.08em", marginBottom: 5 }}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase()}
        </p>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, lineHeight: 1 }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400,
            fontSize: 14, color: t.textSub }}>{greet},</span>
          <span style={{
            fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: 32, fontWeight: 400, color: t.text, letterSpacing: "-0.02em",
            animation: vis ? "curtain 0.7s cubic-bezier(.77,0,.18,1) 0.25s both" : "none",
          }}>Alex.</span>
        </div>
        <p style={{ fontSize: 12, color: t.textSub, marginTop: 5 }}>
          AWS Solutions Architect exam in{" "}
          <span style={{ color: t.bad, fontFamily: "'Instrument Serif', serif", fontWeight: 400, fontStyle: "italic" }}>16 days</span>
          {" "}— keep pushing.{" "}
          <button onClick={() => setPage("exams")} style={{
            background: "none", border: "none", color: t.accent, fontSize: 12,
            fontWeight: 700, cursor: "pointer", textDecoration: "underline",
            textDecorationColor: t.accentBorder,
          }}>View exam →</button>
        </p>
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 12 }}>

        {/* LEFT — Subject progress */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

          {/* Subject mastery */}
          <Card t={t} s={{ padding: "20px 22px", animation: vis ? "pop 0.5s ease 0.18s both" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div>
                <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 4 }}>Subject Mastery</p>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: t.text }}>Your Progress</h3>
              </div>
              <button onClick={() => setPage("subjects")} style={{ fontSize: 11, color: t.accent, fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>All subjects →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {SUBJECTS.map((s, i) => (
                <div key={s.name}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: t.text }}>{s.name}</span>
                    <span style={{ fontSize: 11, fontFamily: "'DM Mono', monospace", color: s.pct >= 70 ? t.good : s.pct >= 50 ? t.warn : t.bad, fontWeight: 700 }}>{s.pct}%</span>
                  </div>
                  <div style={{ height: 6, background: t.bgSub, borderRadius: 99 }}>
                    <div className="bar-grow" style={{ height: "100%", width: `${s.pct}%`, background: t.s[i], borderRadius: 99, animationDelay: `${i * 80}ms` }} />
                  </div>
                  <p style={{ fontSize: 9, color: t.textMuted, marginTop: 4, fontFamily: "'DM Mono', monospace" }}>{s.questions} questions available</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick start */}
          <Card t={t} s={{ padding: "18px 20px", animation: vis ? "pop 0.5s ease 0.25s both" : "none" }}>
            <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 12 }}>Quick Start</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {[
                { label: "Flashcards", icon: "cards", page: "study", color: t.s[0] },
                { label: "Quiz", icon: "quiz", page: "quiz", color: t.s[1] },
                { label: "Speed Round", icon: "lightning", page: "speed", color: t.s[3] },
                { label: "Exams", icon: "calendar", page: "exams", color: t.s[4] },
              ].map(q => (
                <button key={q.label} className="press lift" onClick={() => setPage(q.page)} style={{
                  padding: "14px 8px", borderRadius: 12, background: t.bgSub,
                  border: `1px solid ${t.border}`, display: "flex", flexDirection: "column",
                  alignItems: "center", gap: 8, color: t.textSub, fontSize: 10, fontWeight: 700,
                  transition: "all 180ms", cursor: "pointer",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = q.color + "14"; e.currentTarget.style.borderColor = q.color + "40"; e.currentTarget.style.color = q.color; }}
                  onMouseLeave={e => { e.currentTarget.style.background = t.bgSub; e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSub; }}
                >
                  <Icon name={q.icon} size={18} color="currentColor" />
                  {q.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* RIGHT — Upcoming exams */}
        <div>
          <Card t={t} s={{ padding: "20px", animation: vis ? "pop 0.5s ease 0.22s both" : "none" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace" }}>Upcoming Exams</p>
              <button onClick={() => setPage("exams")} style={{ fontSize: 10, color: t.accent, fontWeight: 700, cursor: "pointer", background: "none", border: "none" }}>All →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {EXAM_LIST.map((ex, i) => (
                <button key={i} onClick={() => setPage("exams")} style={{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "10px 12px", borderRadius: 10, background: ex.days <= 20 ? t.badSoft : t.bgSub,
                  border: `1px solid ${ex.days <= 20 ? t.bad + "25" : "transparent"}`,
                  cursor: "pointer", transition: "all 140ms", width: "100%", textAlign: "left",
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.borderColor = t.accentBorder; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ex.days <= 20 ? t.badSoft : t.bgSub; e.currentTarget.style.borderColor = ex.days <= 20 ? t.bad + "25" : "transparent"; }}
                >
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: t.text }}>{ex.name}</p>
                    <p style={{ fontSize: 9, color: t.textMuted, fontFamily: "'DM Mono', monospace", marginTop: 2 }}>{ex.date}</p>
                  </div>
                  <div style={{
                    fontSize: 11, fontFamily: "'DM Mono', monospace", fontWeight: 800,
                    color: ex.days <= 20 ? t.bad : t.warn,
                    background: ex.days <= 20 ? t.badSoft : t.warnSoft,
                    padding: "4px 9px", borderRadius: 6,
                  }}>{ex.days}d</div>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SUBJECTS PAGE
════════════════════════════════════════════════════════ */
function SubjectsPage({ t, setPage }) {
  return (
    <div style={{ animation: "up 0.4s ease both" }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
          letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>Learning Center</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400,
          fontStyle: "italic", color: t.text, letterSpacing: "-0.02em" }}>Study Materials</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
        {SUBJECTS.map((s, i) => (
          <Card key={s.name} t={t} s={{ padding: "22px", animation: `pop 0.45s ease ${i * 60}ms both` }} className="lift">
            {/* Progress bar */}
            <div style={{ height: 3, background: `${t.s[i]}25`, borderRadius: 99, marginBottom: 18, overflow: "hidden" }}>
              <div className="bar-grow" style={{ height: "100%", width: `${s.pct}%`, background: t.s[i], borderRadius: 99, animationDelay: `${i * 80}ms` }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 4 }}>{s.name}</h3>
                <p style={{ fontSize: 10, color: t.textSub, fontFamily: "'DM Mono', monospace" }}>{s.questions} questions</p>
              </div>
              <div style={{
                fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400,
                color: s.pct >= 70 ? t.good : s.pct >= 50 ? t.warn : t.bad,
                fontStyle: "italic", lineHeight: 1,
              }}>{s.pct}%</div>
            </div>

            <div style={{ display: "flex", gap: 7, marginTop: 4 }}>
              <button className="press" onClick={() => setPage("study")} style={{
                flex: 1, padding: "9px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                background: t.accentSoft, color: t.accent, border: `1px solid ${t.accentBorder}`,
                transition: "background 150ms, color 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = t.accentText; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.color = t.accent; }}
              >Flashcards</button>
              <button className="press" onClick={() => setPage("quiz")} style={{
                flex: 1, padding: "9px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                background: t.bgSub, color: t.textSub, border: `1px solid ${t.border}`,
                transition: "background 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.bgCard; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.bgSub; }}
              >Quiz</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FLASHCARD PAGE
════════════════════════════════════════════════════════ */
function StudyPage({ t }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [score, setScore] = useState({ knew: 0, didnt: 0 });
  const [done, setDone] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const card = CARDS[idx];

  const next = (knew) => {
    setScore(s => ({ knew: s.knew + (knew ? 1 : 0), didnt: s.didnt + (knew ? 0 : 1) }));
    setShowTip(false);
    if (idx < CARDS.length - 1) { setFlipped(false); setTimeout(() => setIdx(i => i + 1), 300); }
    else setDone(true);
  };

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", animation: "up 0.5s ease both" }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 72, fontStyle: "italic",
        color: t.accent, fontWeight: 400, lineHeight: 1, marginBottom: 14 }}>
        {score.knew}/{CARDS.length}
      </div>
      <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 22,
        color: t.text, marginBottom: 6 }}>Session complete.</p>
      <p style={{ fontSize: 13, color: t.textSub, marginBottom: 28 }}>
        You knew <strong>{score.knew}</strong> of {CARDS.length} cards.
      </p>
      <button className="press" onClick={() => { setIdx(0); setFlipped(false); setScore({ knew: 0, didnt: 0 }); setDone(false); }}
        style={{ padding: "11px 26px", borderRadius: 12, background: t.accent,
          color: t.accentText, fontWeight: 800, fontSize: 13, display: "flex", alignItems: "center", gap: 8 }}>
        <Icon name="cards" size={14} color={t.accentText} /> Study Again
      </button>
    </div>
  );

  return (
    <div style={{ animation: "up 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
            letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>Session</p>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 26, fontWeight: 400,
            fontStyle: "italic", color: t.text }}>Flashcards</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 400,
            color: t.accent, fontStyle: "italic" }}>
            {idx + 1}<span style={{ fontSize: 14, color: t.textMuted }}>/{CARDS.length}</span>
          </div>
          <div style={{ fontSize: 10, color: t.textSub, fontFamily: "'DM Mono', monospace" }}>{card.sub}</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: t.bgSub, borderRadius: 99, marginBottom: 22 }}>
        <div style={{ height: "100%", background: t.accent,
          width: `${(idx / CARDS.length) * 100}%`,
          transition: "width 400ms ease", borderRadius: 99 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        {/* Card */}
        <div>
          <div className="flip-root" style={{ width: "100%", height: 260 }}
            onClick={() => setFlipped(f => !f)}>
            <div className={`flip-inner ${flipped ? "flipped" : ""}`}>
              <div className="flip-face" style={{
                background: t.bgCard, border: `1px solid ${t.border}`,
                boxShadow: t.shadow, cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 36,
              }}>
                <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
                  letterSpacing: "0.18em", fontFamily: "'DM Mono', monospace", marginBottom: 20 }}>
                  Tap to reveal
                </p>
                <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, fontWeight: 400,
                  fontStyle: "italic", color: t.text, textAlign: "center", lineHeight: 1.65 }}>
                  {card.q}
                </p>
              </div>
              <div className="flip-face flip-back" style={{
                background: t.bgCard, border: `1px solid ${t.accentBorder}`,
                boxShadow: t.shadowHov, cursor: "pointer",
                display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", padding: 36,
              }}>
                <p style={{ fontSize: 9, color: t.accent, textTransform: "uppercase",
                  letterSpacing: "0.18em", fontFamily: "'DM Mono', monospace",
                  fontWeight: 700, marginBottom: 20 }}>Answer</p>
                <p style={{ fontSize: 13, color: t.text, textAlign: "center",
                  lineHeight: 1.65, maxWidth: 420 }}>{card.a}</p>
              </div>
            </div>
          </div>

          {/* Controls */}
          {flipped ? (
            <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 16,
              animation: "up 0.3s ease both" }}>
              <button className="press" onClick={() => next(false)} style={{
                padding: "10px 28px", borderRadius: 11, fontWeight: 800, fontSize: 13,
                background: t.badSoft, color: t.bad, border: `1px solid ${t.bad}22`,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Icon name="close" size={13} color={t.bad} /> Didn't Know
              </button>
              <button className="press" onClick={() => next(true)} style={{
                padding: "10px 28px", borderRadius: 11, fontWeight: 800, fontSize: 13,
                background: t.goodSoft, color: t.good, border: `1px solid ${t.good}22`,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Icon name="check" size={13} color={t.good} /> Knew It
              </button>
            </div>
          ) : (
            <p style={{ textAlign: "center", marginTop: 14, fontSize: 10, color: t.textMuted,
              fontFamily: "'DM Mono', monospace", letterSpacing: "0.06em" }}>
              Click card to flip
            </p>
          )}

          {/* AI tip toggle */}
          {flipped && !score.knew && (
            <div style={{ textAlign: "center", marginTop: 10 }}>
              <button className="press" onClick={() => setShowTip(p => !p)} style={{
                background: "none", border: `1px solid ${t.border}`,
                borderRadius: 8, padding: "6px 14px", fontSize: 11,
                color: t.accent, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                <Icon name="sparkle" size={12} color={t.accent} />
                {showTip ? "Hide tip" : "Get memory tip"}
              </button>
            </div>
          )}
        </div>

        {/* AI Chat sidebar */}
        <AiChat t={t} context={card.sub} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   QUIZ PAGE
════════════════════════════════════════════════════════ */
function QuizPage({ t }) {
  const [selected, setSelected] = useState(null); // quiz index
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (selected === null) {
    return (
      <div style={{ animation: "up 0.4s ease both" }}>
        <div style={{ marginBottom: 22 }}>
          <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
            letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 6 }}>Interactive</p>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400,
            fontStyle: "italic", color: t.text }}>Practice Questions</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12 }}>
          {QUIZZES.map((q, i) => (
            <Card key={i} t={t} onClick={() => setSelected(i)} s={{
              padding: "24px", animation: `pop 0.45s ease ${i * 80}ms both`,
            }} className="lift">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 11,
                  background: `${t.s[q.color]}18`, border: `1px solid ${t.s[q.color]}30`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="quiz" size={20} color={t.s[q.color]} />
                </div>
                <span style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace",
                  background: t.bgSub, padding: "3px 8px", borderRadius: 5 }}>
                  {q.questions.length} Qs
                </span>
              </div>
              <p style={{ fontSize: 10, color: t.textSub, fontFamily: "'DM Mono', monospace",
                marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>{q.subject}</p>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: t.text, marginBottom: 18, lineHeight: 1.3 }}>{q.title}</h3>
              <button className="press" style={{
                width: "100%", padding: "10px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: t.accentSoft, color: t.accent, border: `1px solid ${t.accentBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                transition: "all 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = t.accentText; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.color = t.accent; }}
                onClick={e => { e.stopPropagation(); setSelected(i); }}
              >
                <Icon name="arrow" size={14} color="currentColor" /> Start Quiz
              </button>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const quiz = QUIZZES[selected];
  const q = quiz.questions[qIdx];

  const reset = () => { setQIdx(0); setAnswered(null); setScore(0); setDone(false); setSelected(null); };

  if (done) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", minHeight: "60vh", animation: "up 0.5s ease both", gap: 8 }}>
      <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 72, fontStyle: "italic",
        color: t.accent, fontWeight: 400, lineHeight: 1 }}>
        {score}/{quiz.questions.length}
      </div>
      <p style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
        fontSize: 22, color: t.text, marginBottom: 6 }}>Quiz complete.</p>
      <p style={{ fontSize: 13, color: t.textSub, marginBottom: 28 }}>
        {score === quiz.questions.length
          ? "Perfect score! Outstanding work."
          : score >= Math.ceil(quiz.questions.length * 0.7)
          ? "Good effort — review the ones you missed."
          : "Keep practicing — you'll get there."}
      </p>
      <div style={{ display: "flex", gap: 12 }}>
        <button className="press" onClick={reset} style={{
          padding: "11px 24px", borderRadius: 12, background: t.bgSub,
          color: t.text, fontWeight: 700, fontSize: 13, border: `1px solid ${t.border}`,
        }}>Back to Quizzes</button>
        <button className="press" onClick={() => { setQIdx(0); setAnswered(null); setScore(0); setDone(false); }} style={{
          padding: "11px 24px", borderRadius: 12, background: t.accent,
          color: t.accentText, fontWeight: 700, fontSize: 13,
          display: "flex", alignItems: "center", gap: 8,
        }}>
          <Icon name="quiz" size={14} color={t.accentText} /> Retry
        </button>
      </div>
    </div>
  );

  const handleAnswer = (choiceIdx) => {
    if (answered !== null) return;
    setAnswered(choiceIdx);
    if (choiceIdx === q.answer) setScore(s => s + 1);
    setTimeout(() => {
      if (qIdx < quiz.questions.length - 1) { setQIdx(i => i + 1); setAnswered(null); }
      else setDone(true);
    }, 1600);
  };

  return (
    <div style={{ animation: "up 0.4s ease both" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 18 }}>
        <div>
          <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
            letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>{quiz.subject}</p>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 24, fontWeight: 400,
            fontStyle: "italic", color: t.text }}>{quiz.title}</h2>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, fontWeight: 400, color: t.accent, fontStyle: "italic" }}>
            {qIdx + 1}<span style={{ fontSize: 14, color: t.textMuted }}>/{quiz.questions.length}</span>
          </div>
          <button className="press" onClick={reset} style={{
            fontSize: 10, color: t.textMuted, cursor: "pointer",
            background: "none", border: "none", fontFamily: "'DM Mono', monospace",
          }}>← Back</button>
        </div>
      </div>

      <div style={{ height: 3, background: t.bgSub, borderRadius: 99, marginBottom: 24 }}>
        <div style={{ height: "100%", background: t.accent, width: `${(qIdx / quiz.questions.length) * 100}%`,
          transition: "width 400ms ease", borderRadius: 99 }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14 }}>
        <div>
          <Card t={t} s={{ padding: "28px 30px", marginBottom: 14 }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 20, fontWeight: 400,
              fontStyle: "italic", color: t.text, lineHeight: 1.6 }}>{q.q}</p>
          </Card>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {q.choices.map((choice, ci) => {
              let bg = t.bgCard, bc = t.border, col = t.text;
              if (answered !== null) {
                if (ci === q.answer) { bg = t.goodSoft; bc = t.good + "60"; col = t.good; }
                else if (ci === answered && ci !== q.answer) { bg = t.badSoft; bc = t.bad + "60"; col = t.bad; }
              }
              return (
                <button key={ci}
                  className={answered !== null && ci === q.answer ? "correct-flash press" : answered !== null && ci === answered ? "wrong-flash press" : "press"}
                  onClick={() => handleAnswer(ci)}
                  style={{
                    width: "100%", textAlign: "left", padding: "14px 18px",
                    borderRadius: 12, border: `1.5px solid ${bc}`,
                    background: bg, color: col, fontSize: 13, fontWeight: 600,
                    cursor: answered !== null ? "default" : "pointer",
                    transition: "all 200ms", display: "flex", alignItems: "center", gap: 12,
                  }}
                  onMouseEnter={e => { if (answered === null) { e.currentTarget.style.borderColor = t.accentBorder; e.currentTarget.style.background = t.accentSoft; }}}
                  onMouseLeave={e => { if (answered === null) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.bgCard; }}}
                >
                  <span style={{ width: 26, height: 26, borderRadius: 7, background: answered !== null && ci === q.answer ? t.good + "22" : t.bgSub,
                    border: `1px solid ${bc}`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, fontFamily: "'DM Mono', monospace", flexShrink: 0, color: col }}>
                    {String.fromCharCode(65 + ci)}
                  </span>
                  {choice}
                  {answered !== null && ci === q.answer && <span style={{ marginLeft: "auto" }}><Icon name="check" size={16} color={t.good} /></span>}
                  {answered !== null && ci === answered && ci !== q.answer && <span style={{ marginLeft: "auto" }}><Icon name="close" size={16} color={t.bad} /></span>}
                </button>
              );
            })}
          </div>
          {answered !== null && (
            <Card t={t} s={{ padding: "16px 20px", marginTop: 14,
              borderLeft: `3px solid ${answered === q.answer ? t.good : t.bad}`,
              animation: "up 0.35s ease both" }}>
              <p style={{ fontSize: 10, fontWeight: 800,
                color: answered === q.answer ? t.good : t.bad,
                textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6,
                fontFamily: "'DM Mono', monospace" }}>
                {answered === q.answer ? "Correct" : "Incorrect"}
              </p>
              <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.6 }}>{q.explain}</p>
            </Card>
          )}
        </div>
        <AiChat t={t} context={quiz.subject} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SPEED ROUND PAGE — 3 Quizlet-style games
════════════════════════════════════════════════════════ */

const GAME_CARDS = [
  { term: "AWS S3 storage class for archival", def: "S3 Glacier Deep Archive", subject: "Cloud Computing" },
  { term: "Default SSH port", def: "Port 22", subject: "Networking" },
  { term: "CIA triad in security", def: "Confidentiality, Integrity, Availability", subject: "Cybersecurity" },
  { term: "Docker networking default mode", def: "Bridge network", subject: "DevOps" },
  { term: "OSI model layer 7", def: "Application Layer", subject: "Networking" },
  { term: "AWS service for DNS", def: "Route 53", subject: "Cloud Computing" },
  { term: "Kubernetes smallest deployable unit", def: "Pod", subject: "DevOps" },
  { term: "Asymmetric encryption algorithm", def: "RSA (Rivest-Shamir-Adleman)", subject: "Cybersecurity" },
  { term: "Git command to merge branches", def: "git merge <branch-name>", subject: "DevOps" },
  { term: "TCP three-way handshake", def: "SYN → SYN-ACK → ACK", subject: "Networking" },
  { term: "AWS IAM policy effect types", def: "Allow or Deny", subject: "Cloud Computing" },
  { term: "XSS attack prevention", def: "Input validation and output encoding", subject: "Cybersecurity" },
];

// ── MATCH GAME ─────────────────────────────────────────
function MatchGame({ t, onBack }) {
  const POOL_SIZE = 6;
  const pool = useRef(GAME_CARDS.sort(() => Math.random() - 0.5).slice(0, POOL_SIZE));
  const tiles = useRef(() => {
    const terms = pool.current.map((c, i) => ({ id: `t${i}`, text: c.term, pairId: i, type: "term" }));
    const defs  = pool.current.map((c, i) => ({ id: `d${i}`, text: c.def,  pairId: i, type: "def"  }));
    return [...terms, ...defs].sort(() => Math.random() - 0.5);
  }).current;

  const [items] = useState(tiles);
  const [selected, setSelected] = useState(null); // tile id
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [shake, setShake] = useState(new Set());

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 500);
    return () => clearInterval(id);
  }, [done, startTime]);

  const select = (tile) => {
    if (matched.has(tile.id) || wrong.has(tile.id)) return;
    if (selected === tile.id) { setSelected(null); return; }
    if (!selected) { setSelected(tile.id); return; }

    const a = items.find(i => i.id === selected);
    const b = tile;
    setMoves(m => m + 1);

    if (a.pairId === b.pairId && a.type !== b.type) {
      const newMatched = new Set([...matched, a.id, b.id]);
      setMatched(newMatched);
      setSelected(null);
      if (newMatched.size === items.length) setDone(true);
    } else {
      setShake(new Set([a.id, b.id]));
      setTimeout(() => setShake(new Set()), 500);
      setSelected(null);
    }
  };

  const fmt = s => `${Math.floor(s/60)}:${String(s%60).padStart(2,"0")}`;

  if (done) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"55vh", gap:10, animation:"up 0.5s ease both" }}>
      <div style={{ fontFamily:"'Instrument Serif', serif", fontSize:72, fontStyle:"italic", color:t.good, lineHeight:1 }}>✓</div>
      <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:28, color:t.text }}>All matched!</h3>
      <div style={{ display:"flex", gap:24, margin:"8px 0 24px" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:28, color:t.accent }}>{fmt(elapsed)}</div>
          <div style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Time</div>
        </div>
        <div style={{ textAlign:"center" }}>
          <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:28, color:t.s[1] }}>{moves}</div>
          <div style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Moves</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:10 }}>
        <button className="press" onClick={onBack} style={{ padding:"10px 22px", borderRadius:11, background:t.bgSub, color:t.text, fontWeight:700, fontSize:13, border:`1px solid ${t.border}` }}>Back</button>
        <button className="press" onClick={() => window.location.reload()} style={{ padding:"10px 22px", borderRadius:11, background:t.accent, color:t.accentText, fontWeight:700, fontSize:13 }}>Play Again</button>
      </div>
    </div>
  );

  return (
    <div style={{ animation:"up 0.4s ease both" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:22, color:t.text }}>Match</h3>
          <p style={{ fontSize:11, color:t.textSub }}>Connect each term with its definition</p>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ fontFamily:"'DM Mono', monospace", fontSize:14, color:t.textMuted }}>{fmt(elapsed)}</div>
          <div style={{ fontSize:12, color:t.textSub }}>{matched.size/2}/{POOL_SIZE} matched</div>
          <button className="press" onClick={onBack} style={{ padding:"6px 14px", borderRadius:8, background:t.bgSub, color:t.textSub, border:`1px solid ${t.border}`, fontSize:11, fontWeight:700 }}>← Back</button>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
        {items.map(item => {
          const isSelected = selected === item.id;
          const isMatched = matched.has(item.id);
          const isShaking = shake.has(item.id);
          return (
            <button key={item.id} onClick={() => select(item)}
              className={isShaking ? "shake-no press" : "press lift"}
              style={{
                padding:"16px 12px", borderRadius:14, fontSize:11, fontWeight:600,
                textAlign:"center", lineHeight:1.45, minHeight:90,
                border: isMatched ? `2px solid ${t.good}` :
                        isSelected ? `2px solid ${t.accent}` :
                        `2px solid ${t.border}`,
                background: isMatched ? t.goodSoft :
                            isSelected ? t.accentSoft :
                            t.bgCard,
                color: isMatched ? t.good : isSelected ? t.accent : t.text,
                cursor: isMatched ? "default" : "pointer",
                opacity: isMatched ? 0.7 : 1,
                transition:"all 200ms",
                boxShadow: isSelected ? `0 0 0 3px ${t.accent}22` : t.shadow,
              }}>
              {item.text}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── GRAVITY GAME ─────────────────────────────────────────
function GravityGame({ t, onBack }) {
  const FALL_DURATION = 9; // seconds per card
  const [queue, setQueue] = useState(() => [...GAME_CARDS].sort(() => Math.random() - 0.5));
  const [current, setCurrent] = useState(null);
  const [input, setInput] = useState("");
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [fallPct, setFallPct] = useState(0);
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(null); // "good" | "bad"
  const [done, setDone] = useState(false);
  const [hint, setHint] = useState("");
  const startRef = useRef(null);
  const rafRef = useRef(null);
  const inputRef = useRef(null);

  const nextCard = useCallback(() => {
    setQueue(q => {
      const rest = q.slice(1);
      if (rest.length === 0) { setDone(true); return q; }
      setCurrent(rest[0]);
      setInput("");
      setHint("");
      setFallPct(0);
      startRef.current = Date.now();
      return rest;
    });
  }, []);

  useEffect(() => {
    if (queue.length > 0) {
      setCurrent(queue[0]);
      startRef.current = Date.now();
    }
  }, []);

  useEffect(() => {
    if (!current || done) return;
    const tick = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const pct = Math.min(elapsed / FALL_DURATION, 1);
      setFallPct(pct);
      if (pct >= 1) {
        setLives(l => {
          const next = l - 1;
          if (next <= 0) { setDone(true); return 0; }
          return next;
        });
        setFlash("bad");
        setTimeout(() => setFlash(null), 400);
        nextCard();
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [current, done, nextCard]);

  const submit = () => {
    if (!current || !input.trim()) return;
    const answer = current.def.toLowerCase();
    const typed = input.trim().toLowerCase();
    // fuzzy: typed must be a significant substring of the answer
    const words = answer.split(" ");
    const typedWords = typed.split(" ").filter(Boolean);
    const matchCount = typedWords.filter(w => w.length > 2 && answer.includes(w)).length;
    const ok = answer.includes(typed) || matchCount >= Math.max(1, Math.floor(typedWords.length * 0.6));

    if (ok) {
      setScore(s => s + 1);
      setFlash("good");
      setTimeout(() => setFlash(null), 350);
      cancelAnimationFrame(rafRef.current);
      nextCard();
    } else {
      setShake(true);
      setFlash("bad");
      setTimeout(() => { setShake(false); setFlash(null); }, 500);
      setHint(`Hint: ${current.def.slice(0, Math.ceil(current.def.length * 0.4))}…`);
    }
    setInput("");
    inputRef.current?.focus();
  };

  if (done) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"55vh", gap:10, animation:"up 0.5s ease both" }}>
      <div style={{ fontFamily:"'Instrument Serif', serif", fontSize:72, fontStyle:"italic", color:t.accent, lineHeight:1 }}>{score}</div>
      <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:24, color:t.text }}>Survived!</h3>
      <p style={{ fontSize:13, color:t.textSub, marginBottom:20 }}>You typed {score} correct answers before time ran out.</p>
      <div style={{ display:"flex", gap:10 }}>
        <button className="press" onClick={onBack} style={{ padding:"10px 22px", borderRadius:11, background:t.bgSub, color:t.text, fontWeight:700, border:`1px solid ${t.border}` }}>Back</button>
        <button className="press" onClick={() => window.location.reload()} style={{ padding:"10px 22px", borderRadius:11, background:t.accent, color:t.accentText, fontWeight:700 }}>Retry</button>
      </div>
    </div>
  );

  const flashBg = flash === "good" ? t.goodSoft : flash === "bad" ? t.badSoft : "transparent";

  return (
    <div style={{ animation:"up 0.4s ease both" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <div>
          <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:22, color:t.text }}>Gravity</h3>
          <p style={{ fontSize:11, color:t.textSub }}>Type the definition before the card lands</p>
        </div>
        <div style={{ display:"flex", gap:16, alignItems:"center" }}>
          <div style={{ display:"flex", gap:5 }}>
            {[0,1,2].map(i => (
              <span key={i} style={{ fontSize:16, opacity: i < lives ? 1 : 0.2 }}>♥</span>
            ))}
          </div>
          <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:18, color:t.accent }}>{score}</div>
          <button className="press" onClick={onBack} style={{ padding:"6px 14px", borderRadius:8, background:t.bgSub, color:t.textSub, border:`1px solid ${t.border}`, fontSize:11, fontWeight:700 }}>← Back</button>
        </div>
      </div>

      {/* Fall zone */}
      <div style={{ position:"relative", height:220, borderRadius:20, overflow:"hidden", background:t.bgSub, border:`1px solid ${t.border}`, marginBottom:14, transition:`background 200ms`, backgroundColor: flashBg || t.bgSub }}>
        {/* Ground */}
        <div style={{ position:"absolute", bottom:0, left:0, right:0, height:4, background:t.borderStrong, borderRadius:"0 0 20px 20px" }} />

        {current && (
          <div style={{
            position:"absolute", left:"50%", transform:"translateX(-50%)",
            top: `${fallPct * 80}%`,
            padding:"14px 22px", borderRadius:14,
            background:t.bgCard, border:`1.5px solid ${t.border}`,
            boxShadow: t.shadow,
            textAlign:"center", maxWidth:340, transition:"top 0.1s linear",
          }}>
            <p style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:5 }}>{current.subject}</p>
            <p style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:16, color:t.text, lineHeight:1.5 }}>{current.term}</p>
          </div>
        )}

        {/* Timer bar */}
        <div style={{ position:"absolute", bottom:4, left:0, right:0, height:4, background:t.divider }}>
          <div style={{ height:"100%", width:`${(1 - fallPct) * 100}%`,
            background: fallPct < 0.5 ? t.good : fallPct < 0.75 ? t.warn : t.bad,
            transition:"width 0.1s linear, background 0.3s", borderRadius:4 }} />
        </div>
      </div>

      {hint && <p style={{ fontSize:11, color:t.warn, marginBottom:8, fontStyle:"italic" }}>{hint}</p>}

      <div className={shake ? "shake-no" : ""} style={{ display:"flex", gap:10 }}>
        <input
          ref={inputRef}
          autoFocus
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="Type the definition…"
          style={{
            flex:1, padding:"12px 16px", borderRadius:12, fontSize:14, color:t.text,
            background:t.inputBg, border:`1.5px solid ${t.border}`, outline:"none",
            fontFamily:"'DM Sans', sans-serif", transition:"border-color 200ms",
          }}
          onFocus={e => e.target.style.borderColor = t.accentBorder}
          onBlur={e => e.target.style.borderColor = t.border}
        />
        <button className="press" onClick={submit} style={{
          padding:"12px 22px", borderRadius:12, background:t.accent, color:t.accentText,
          fontWeight:800, fontSize:14,
        }}>Answer</button>
      </div>
    </div>
  );
}

// ── BLITZ GAME (rapid MCQ) ───────────────────────────────
function BlitzGame({ t, onBack }) {
  const TIME_PER_Q = 8;
  const [questions] = useState(() => [...GAME_CARDS].sort(() => Math.random() - 0.5).map(card => {
    // Build 4 choices: correct + 3 distractors
    const wrong = GAME_CARDS.filter(c => c.def !== card.def)
      .sort(() => Math.random() - 0.5).slice(0, 3).map(c => c.def);
    const choices = [...wrong, card.def].sort(() => Math.random() - 0.5);
    return { ...card, choices, answer: choices.indexOf(card.def) };
  }));
  const [qIdx, setQIdx] = useState(0);
  const [answered, setAnswered] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_Q);
  const [xp, setXp] = useState(0);
  const [pops, setPops] = useState([]);
  const [done, setDone] = useState(false);
  const timerRef = useRef(null);
  const answeredRef = useRef(null);
  const qIdxRef = useRef(0);
  const streakRef = useRef(0);
  const timeLeftRef = useRef(TIME_PER_Q);

  const handleAnswer = useCallback((ci) => {
    if (answeredRef.current !== null) return;
    clearInterval(timerRef.current);
    answeredRef.current = ci;
    const qi = qIdxRef.current;
    const q = questions[qi];
    const correct = ci === q.answer;
    setAnswered(ci);
    const newStreak = correct ? streakRef.current + 1 : 0;
    streakRef.current = newStreak;
    setStreak(newStreak);
    setMaxStreak(ms => Math.max(ms, newStreak));
    let gained = 0;
    if (correct) {
      gained = 100 + Math.floor((timeLeftRef.current / TIME_PER_Q) * 50);
      if (newStreak === 3) gained += 150;
      if (newStreak >= 5 && newStreak % 5 === 0) gained += 300;
      setScore(s => s + 1);
      setXp(p => p + gained);
      const id = Date.now();
      setPops(p => [...p, { id, gained }]);
      setTimeout(() => setPops(p => p.filter(x => x.id !== id)), 1200);
    }
    setTimeout(() => {
      if (qi >= questions.length - 1) { setDone(true); return; }
      qIdxRef.current = qi + 1;
      answeredRef.current = null;
      setQIdx(qi + 1);
      setAnswered(null);
      timeLeftRef.current = TIME_PER_Q;
      setTimeLeft(TIME_PER_Q);
    }, correct ? 700 : 1100);
  }, [questions]);

  useEffect(() => {
    if (answered !== null || done) return;
    timerRef.current = setInterval(() => {
      timeLeftRef.current = Math.max(0, timeLeftRef.current - 0.1);
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0.05) {
        clearInterval(timerRef.current);
        handleAnswer(-1);
      }
    }, 100);
    return () => clearInterval(timerRef.current);
  }, [answered, qIdx, done, handleAnswer]);

  useEffect(() => {
    if (done || answered !== null) return;
    const h = (e) => {
      const map = {"1":0,"2":1,"3":2,"4":3,"a":0,"b":1,"c":2,"d":3};
      const i = map[e.key.toLowerCase()];
      if (i !== undefined) handleAnswer(i);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [done, answered, qIdx, handleAnswer]);

  if (done) {
    const pct = Math.round(score / questions.length * 100);
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"55vh", gap:8, animation:"up 0.5s ease both" }}>
        <div style={{ fontFamily:"'Instrument Serif', serif", fontSize:72, fontStyle:"italic", color:t.accent, lineHeight:1 }}>{score}/{questions.length}</div>
        <h3 style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:24, color:t.text }}>{pct === 100 ? "Perfect!" : pct >= 75 ? "Excellent" : pct >= 50 ? "Good Work" : "Keep Practicing"}</h3>
        <div style={{ display:"flex", gap:24, margin:"10px 0 20px" }}>
          {[{label:"XP",val:xp.toLocaleString(),color:t.accent},{label:"Max Streak",val:`×${maxStreak}`,color:t.warn},{label:"Accuracy",val:`${pct}%`,color:t.good}].map((s,i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:26, color:s.color }}>{s.val}</div>
              <div style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:10 }}>
          <button className="press" onClick={onBack} style={{ padding:"10px 22px", borderRadius:11, background:t.bgSub, color:t.text, fontWeight:700, border:`1px solid ${t.border}` }}>Back</button>
          <button className="press" onClick={() => window.location.reload()} style={{ padding:"10px 22px", borderRadius:11, background:t.accent, color:t.accentText, fontWeight:700 }}>Play Again</button>
        </div>
      </div>
    );
  }

  const q = questions[qIdx];
  const timerFrac = timeLeft / TIME_PER_Q;
  const timerCol = timerFrac > 0.5 ? t.good : timerFrac > 0.25 ? t.warn : t.bad;

  return (
    <div style={{ animation:"up 0.35s ease both" }}>
      {/* XP pops */}
      {pops.map(p => (
        <div key={p.id} className="xp-float" style={{ position:"fixed", top:"18%", left:"60%", fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:22, color:t.good, pointerEvents:"none", zIndex:9999 }}>
          +{p.gained} XP
        </div>
      ))}

      {/* HUD */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div style={{ display:"flex", gap:18 }}>
          <div>
            <div style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>Score</div>
            <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:20, color:t.text }}>{score}/{questions.length}</div>
          </div>
          <div>
            <div style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em" }}>XP</div>
            <div style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:20, color:t.accent }}>{xp}</div>
          </div>
          {streak >= 2 && (
            <div className="streak-burst" style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 12px", borderRadius:99, background:t.warnSoft, border:`1px solid ${t.warn}40` }}>
              <Icon name="flame" size={13} color="#FF6B1A" />
              <span style={{ fontFamily:"'DM Mono', monospace", fontSize:13, fontWeight:700, color:t.warn }}>×{streak}</span>
            </div>
          )}
        </div>
        <button className="press" onClick={onBack} style={{ padding:"6px 14px", borderRadius:8, background:t.bgSub, color:t.textSub, border:`1px solid ${t.border}`, fontSize:11, fontWeight:700 }}>← Back</button>
      </div>

      {/* Timer bar */}
      <div style={{ height:5, background:t.bgSub, borderRadius:99, marginBottom:18 }}>
        <div style={{ height:"100%", width:`${timerFrac * 100}%`, background:timerCol, borderRadius:99, transition:"width 0.1s linear, background 0.3s" }} />
      </div>

      {/* Question card */}
      <Card t={t} s={{ padding:"26px 28px", marginBottom:14 }}>
        <p style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:10 }}>{q.subject} — Q{qIdx+1}/{questions.length}</p>
        <p style={{ fontFamily:"'Instrument Serif', serif", fontStyle:"italic", fontSize:20, color:t.text, lineHeight:1.55 }}>{q.term}</p>
      </Card>

      {/* Answer choices */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:9 }}>
        {q.choices.map((choice, ci) => {
          let bg = t.bgCard, bc = t.border, col = t.text;
          if (answered !== null) {
            if (ci === q.answer) { bg = t.goodSoft; bc = t.good + "60"; col = t.good; }
            else if (ci === answered) { bg = t.badSoft; bc = t.bad + "60"; col = t.bad; }
          }
          const label = ["A","B","C","D"][ci];
          return (
            <button key={ci}
              onClick={() => handleAnswer(ci)}
              className={answered !== null && ci === q.answer ? "correct-flash press" : answered !== null && ci === answered ? "wrong-flash press" : "press"}
              style={{
                padding:"14px 16px", borderRadius:13, border:`1.5px solid ${bc}`,
                background:bg, color:col, fontSize:12, fontWeight:600,
                cursor:answered !== null ? "default" : "pointer",
                textAlign:"left", display:"flex", alignItems:"center", gap:12,
                transition:"all 180ms", minHeight:64,
              }}
              onMouseEnter={e => { if (answered === null) { e.currentTarget.style.borderColor = t.accentBorder; e.currentTarget.style.background = t.accentSoft; }}}
              onMouseLeave={e => { if (answered === null) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.background = t.bgCard; }}}
            >
              <span style={{ width:26, height:26, borderRadius:7, flexShrink:0, fontSize:10, fontWeight:800, fontFamily:"'DM Mono', monospace",
                background:answered !== null && ci === q.answer ? t.good+"22" : t.bgSub, border:`1px solid ${bc}`,
                display:"flex", alignItems:"center", justifyContent:"center", color:col }}>{label}</span>
              {choice}
              {answered !== null && ci === q.answer && <span style={{ marginLeft:"auto" }}><Icon name="check" size={14} color={t.good} /></span>}
              {answered !== null && ci === answered && ci !== q.answer && <span style={{ marginLeft:"auto" }}><Icon name="close" size={14} color={t.bad} /></span>}
            </button>
          );
        })}
      </div>
      <p style={{ fontSize:9, color:t.textMuted, fontFamily:"'DM Mono', monospace", marginTop:12, textAlign:"center" }}>Press 1-4 or A-D to answer</p>
    </div>
  );
}

// ── SPEED ROUND MENU ────────────────────────────────────
function SpeedRoundPage({ t }) {
  const [game, setGame] = useState(null); // "match" | "gravity" | "blitz"

  if (game === "match")   return <MatchGame   t={t} onBack={() => setGame(null)} />;
  if (game === "gravity") return <GravityGame t={t} onBack={() => setGame(null)} />;
  if (game === "blitz")   return <BlitzGame   t={t} onBack={() => setGame(null)} />;

  const GAMES = [
    {
      id: "match",
      icon: "grid",
      title: "Match",
      subtitle: "Race the clock",
      desc: "Tap terms and definitions to pair them up as fast as you can. All pairs must match before time runs out.",
      color: 0,
      badge: "Memory",
    },
    {
      id: "gravity",
      icon: "arrowup",
      title: "Gravity",
      subtitle: "Type to survive",
      desc: "Cards fall from the top. Type the definition before it hits the ground. Lose a life for every miss.",
      color: 1,
      badge: "Recall",
    },
    {
      id: "blitz",
      icon: "lightning",
      title: "Blitz",
      subtitle: "8 seconds per question",
      desc: "12 rapid-fire multiple choice questions. Build streaks for bonus XP. Press A-D to answer faster.",
      color: 3,
      badge: "Speed",
    },
  ];

  return (
    <div style={{ animation:"up 0.4s ease both" }}>
      <div style={{ marginBottom:28 }}>
        <p style={{ fontSize:9, color:t.textMuted, textTransform:"uppercase", letterSpacing:"0.14em", fontFamily:"'DM Mono', monospace", marginBottom:5 }}>Game Modes</p>
        <h2 style={{ fontFamily:"'Instrument Serif', serif", fontSize:28, fontWeight:400, fontStyle:"italic", color:t.text }}>Speed Round</h2>
        <p style={{ fontSize:13, color:t.textSub, marginTop:6 }}>Three ways to drill your knowledge — each with a different twist.</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:14 }}>
        {GAMES.map((g, i) => (
          <button key={g.id} onClick={() => setGame(g.id)}
            className="press lift"
            style={{
              padding:"28px 24px", borderRadius:20, textAlign:"left",
              background:t.bgCard, border:`1.5px solid ${t.border}`,
              boxShadow:t.shadow, cursor:"pointer",
              animation:`pop 0.45s ease ${i*90}ms both`,
              transition:"all 240ms",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = t.s[g.color]; e.currentTarget.style.boxShadow = `0 0 0 3px ${t.s[g.color]}18, ${t.shadowHov}`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.boxShadow = t.shadow; }}
          >
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div style={{ width:50, height:50, borderRadius:14, background:`${t.s[g.color]}18`, border:`1px solid ${t.s[g.color]}30`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <Icon name={g.icon} size={24} color={t.s[g.color]} />
              </div>
              <span style={{ fontSize:9, fontWeight:800, textTransform:"uppercase", letterSpacing:"0.12em", padding:"3px 9px", borderRadius:6, background:`${t.s[g.color]}15`, color:t.s[g.color], fontFamily:"'DM Mono', monospace" }}>{g.badge}</span>
            </div>
            <h3 style={{ fontSize:20, fontWeight:800, color:t.text, marginBottom:3 }}>{g.title}</h3>
            <p style={{ fontSize:11, color:t.s[g.color], fontWeight:700, marginBottom:12, fontFamily:"'DM Mono', monospace", textTransform:"uppercase", letterSpacing:"0.08em" }}>{g.subtitle}</p>
            <p style={{ fontSize:12, color:t.textSub, lineHeight:1.65 }}>{g.desc}</p>
            <div style={{ marginTop:20, display:"flex", alignItems:"center", gap:6, color:t.s[g.color], fontWeight:700, fontSize:12 }}>
              Play <Icon name="arrow" size={13} color={t.s[g.color]} />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   EXAMS PAGE
════════════════════════════════════════════════════════ */
function ExamsPage({ t, setPage }) {
  const next = EXAM_LIST[0];
  const [activeTab, setActiveTab] = useState("upcoming");

  return (
    <div style={{ animation: "up 0.4s ease both" }}>
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
          letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>Certification Planner</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400,
          fontStyle: "italic", color: t.text }}>Exam Schedule</h2>
      </div>

      <Card t={t} s={{ padding: "28px 30px", marginBottom: 14,
        animation: "pop 0.5s ease both", borderTop: `3px solid ${t.bad}` }}>
        <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
          letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 14 }}>Next Exam — Critical</p>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h3 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
              fontSize: 28, fontWeight: 400, color: t.text, marginBottom: 6 }}>{next.name}</h3>
            <p style={{ fontSize: 12, color: t.textSub, fontFamily: "'DM Mono', monospace", marginBottom: 16 }}>{next.date}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="press" onClick={() => setPage("study")} style={{
                padding: "9px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: t.accent, color: t.accentText,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Icon name="cards" size={13} color={t.accentText} /> Study Now
              </button>
              <button className="press" onClick={() => setPage("quiz")} style={{
                padding: "9px 20px", borderRadius: 10, fontSize: 12, fontWeight: 700,
                background: t.bgSub, color: t.text, border: `1px solid ${t.border}`,
                display: "flex", alignItems: "center", gap: 7,
              }}>
                <Icon name="quiz" size={13} color={t.text} /> Take Quiz
              </button>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
              fontSize: 80, fontWeight: 400, color: t.bad, lineHeight: 1, letterSpacing: "-0.04em" }}>{next.days}</div>
            <div style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace", letterSpacing: "0.08em" }}>DAYS LEFT</div>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <p style={{ fontSize: 10, color: t.textSub }}>Subject mastery: <strong style={{ color: t.text }}>{SUBJECTS[next.sub].pct}%</strong></p>
            <p style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>Target: 80%</p>
          </div>
          <div style={{ height: 5, background: t.bgSub, borderRadius: 99 }}>
            <div className="bar-grow" style={{ height: "100%", width: `${SUBJECTS[next.sub].pct}%`,
              background: SUBJECTS[next.sub].pct >= 80 ? t.good : t.warn, borderRadius: 99 }} />
          </div>
        </div>
      </Card>

      <div style={{ display: "flex", gap: 2, background: t.bgSub, borderRadius: 10,
        padding: 3, marginBottom: 14, width: "fit-content" }}>
        {["upcoming", "past"].map(tab => (
          <button key={tab} className="press" onClick={() => setActiveTab(tab)} style={{
            padding: "6px 18px", borderRadius: 8, fontSize: 11, fontWeight: 700,
            background: activeTab === tab ? t.bgCard : "transparent",
            color: activeTab === tab ? t.text : t.textMuted,
            border: activeTab === tab ? `1px solid ${t.border}` : "1px solid transparent",
            boxShadow: activeTab === tab ? t.shadow : "none", transition: "all 200ms", textTransform: "capitalize",
          }}>{tab}</button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {EXAM_LIST.map((ex, i) => (
          <Card key={i} t={t} s={{ padding: "20px 22px", animation: `pop 0.45s ease ${i * 70}ms both` }}
            className="lift" onClick={() => setPage("study")}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
              <div>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: t.text, marginBottom: 4 }}>{ex.name}</h4>
                <p style={{ fontSize: 10, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>{ex.date}</p>
              </div>
              <div style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
                fontSize: 22, fontWeight: 400, color: ex.days <= 10 ? t.bad : t.warn,
                background: ex.days <= 10 ? t.badSoft : t.warnSoft, padding: "2px 10px", borderRadius: 8 }}>
                {ex.days}d
              </div>
            </div>
            <div style={{ height: 4, background: t.bgSub, borderRadius: 99, marginBottom: 6 }}>
              <div className="bar-grow" style={{ height: "100%", width: `${SUBJECTS[ex.sub].pct}%`,
                background: t.s[ex.sub], borderRadius: 99, animationDelay: `${i * 80}ms` }} />
            </div>
            <p style={{ fontSize: 10, color: t.textMuted, marginBottom: 12 }}>
              Mastery: <span style={{ color: t.text, fontWeight: 700 }}>{SUBJECTS[ex.sub].pct}%</span>{" · "}{SUBJECTS[ex.sub].name}
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="press" onClick={e => { e.stopPropagation(); setPage("study"); }} style={{
                flex: 1, padding: "8px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                background: t.accentSoft, color: t.accent, border: `1px solid ${t.accentBorder}`, transition: "all 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.accent; e.currentTarget.style.color = t.accentText; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.accentSoft; e.currentTarget.style.color = t.accent; }}
              >Flashcards</button>
              <button className="press" onClick={e => { e.stopPropagation(); setPage("quiz"); }} style={{
                flex: 1, padding: "8px", borderRadius: 9, fontSize: 11, fontWeight: 700,
                background: t.bgSub, color: t.textSub, border: `1px solid ${t.border}`, transition: "background 150ms",
              }}
                onMouseEnter={e => { e.currentTarget.style.background = t.bgCard; }}
                onMouseLeave={e => { e.currentTarget.style.background = t.bgSub; }}
              >Quiz</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   SETTINGS PAGE
════════════════════════════════════════════════════════ */
function SettingsPage({ t, themeId, setThemeId }) {
  const [name, setName] = useState("Alex Torres");
  const [email, setEmail] = useState("alex@certstack.io");
  const [examTarget, setExamTarget] = useState("AWS Solutions Architect");
  const [dailyQ, setDailyQ] = useState("50");
  const [saved, setSaved] = useState(false);

  const save = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };

  const FieldRow = ({ label, value, onChange, type = "text" }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "11px 0", borderBottom: `1px solid ${t.divider}` }}>
      <label style={{ fontSize: 12, color: t.textSub, fontWeight: 500 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)}
        style={{
          background: t.inputBg, border: `1px solid ${t.border}`,
          borderRadius: 8, padding: "5px 10px", fontSize: 12, color: t.text,
          fontFamily: "'DM Sans', sans-serif", outline: "none",
          width: type === "number" ? 72 : 180, textAlign: type === "number" ? "right" : "left",
          transition: "border-color 150ms",
        }}
        onFocus={e => e.target.style.borderColor = t.accentBorder}
        onBlur={e => e.target.style.borderColor = t.border}
      />
    </div>
  );

  return (
    <div style={{ animation: "up 0.4s ease both", maxWidth: 560 }}>
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 9, color: t.textMuted, textTransform: "uppercase",
          letterSpacing: "0.14em", fontFamily: "'DM Mono', monospace", marginBottom: 5 }}>Preferences</p>
        <h2 style={{ fontFamily: "'Instrument Serif', serif", fontSize: 28, fontWeight: 400,
          fontStyle: "italic", color: t.text }}>Settings</h2>
      </div>

      {/* Profile */}
      <Card t={t} s={{ padding: "22px", marginBottom: 12, animation: "pop 0.5s ease both" }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: t.text, marginBottom: 14,
          textTransform: "uppercase", letterSpacing: "0.1em" }}>Profile</h4>
        <FieldRow label="Full name" value={name} onChange={setName} />
        <FieldRow label="Email" value={email} onChange={setEmail} type="email" />
        <FieldRow label="Target exam" value={examTarget} onChange={setExamTarget} />
        <div style={{ paddingTop: 12 }}>
          <button className="press" style={{
            padding: "5px 10px", borderRadius: 7, fontSize: 10, fontWeight: 700,
            background: t.bgSub, color: t.textSub, border: `1px solid ${t.border}`,
            display: "flex", alignItems: "center", gap: 6,
          }}>
            <Icon name="lock" size={11} color={t.textSub} /> Change password
          </button>
        </div>
      </Card>

      {/* Appearance */}
      <Card t={t} s={{ padding: "22px", marginBottom: 12, animation: "pop 0.5s ease 0.06s both" }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: t.text, marginBottom: 4,
          textTransform: "uppercase", letterSpacing: "0.1em" }}>Appearance</h4>
        <p style={{ fontSize: 11, color: t.textSub, marginBottom: 16 }}>Choose your interface theme</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {Object.values(THEMES).map((th) => (
            <button key={th.id} className="press" onClick={() => setThemeId(th.id)} style={{
              borderRadius: 12, padding: "14px 10px",
              border: themeId === th.id ? `2px solid ${t.text}` : `2px solid ${t.border}`,
              background: th.bg, cursor: "pointer",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              transition: "border-color 150ms",
            }}>
              <div style={{ width: 40, height: 30, borderRadius: 8, background: th.bgCard,
                border: `1px solid ${th.border}`, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 9, background: th.accent }} />
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: th.text,
                letterSpacing: "0.04em", textTransform: "uppercase" }}>{th.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Study goals */}
      <Card t={t} s={{ padding: "22px", marginBottom: 12, animation: "pop 0.5s ease 0.12s both" }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: t.text, marginBottom: 14,
          textTransform: "uppercase", letterSpacing: "0.1em" }}>Study Goals</h4>
        <FieldRow label="Daily questions target" value={dailyQ} onChange={setDailyQ} type="number" />
      </Card>

      {/* Account */}
      <Card t={t} s={{ padding: "22px", animation: "pop 0.5s ease 0.18s both", borderColor: t.bad + "30" }}>
        <h4 style={{ fontSize: 11, fontWeight: 800, color: t.bad, marginBottom: 12,
          textTransform: "uppercase", letterSpacing: "0.1em" }}>Account</h4>
        <button className="press" style={{
          padding: "8px 16px", borderRadius: 9, fontSize: 11, fontWeight: 700,
          background: t.badSoft, color: t.bad, border: `1px solid ${t.bad}30`,
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <Icon name="logout" size={12} color={t.bad} /> Sign out
        </button>
      </Card>

      <div style={{ marginTop: 16, display: "flex", justifyContent: "flex-end" }}>
        <button className="press" onClick={save} style={{
          padding: "11px 28px", borderRadius: 12, fontSize: 13, fontWeight: 800,
          background: saved ? t.good : t.accent, color: t.accentText, transition: "background 300ms",
          display: "flex", alignItems: "center", gap: 8,
        }}>
          {saved ? <><Icon name="check" size={14} color={t.accentText} /> Saved!</> : "Save changes"}
        </button>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════════════ */
function LandingPage({ t, onSignIn, onSignUp }) {
  const FEATURES = [
    { icon: "cards", title: "Flashcard Decks", desc: "Flip-cards built from real exam material. Study at your own pace, then drill weak spots.", color: 0 },
    { icon: "quiz", title: "Practice Quizzes", desc: "Exam-style multiple choice with instant explanations. Know why you got it wrong, not just what.", color: 1 },
    { icon: "brain", title: "AI Tutor", desc: "A RAG-powered assistant that guides you through reasoning step by step — without giving away the answer.", color: 2 },
    { icon: "lightning", title: "Speed Rounds", desc: "Three Quizlet-style game modes to drill under pressure: Match, Gravity, and rapid-fire Blitz.", color: 3 },
    { icon: "calendar", title: "Exam Countdown", desc: "Track every upcoming exam with days remaining and a clear path to readiness.", color: 4 },
    { icon: "grid", title: "Subject Tracking", desc: "Per-subject mastery scores across every exam type — FE, PE, CPA, AWS, and more.", color: 0 },
  ];

  return (
    <div style={{ minHeight: "100vh", background: t.bg, color: t.text, overflow: "auto", fontFamily: "'DM Sans', sans-serif" }}>
      <nav style={{
        position: "sticky", top: 0, zIndex: 100,
        display: "flex", alignItems: "center", padding: "0 40px", height: 58,
        borderBottom: `1px solid ${t.border}`,
        background: t.bg + "ee", backdropFilter: "blur(16px)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: t.accentSoft,
            border: `1px solid ${t.accentBorder}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="9" rx="2.5" fill={t.accent} opacity="0.15"/>
              <rect x="3" y="5" width="14" height="9" rx="2.5" fill={t.accent} opacity="0.3"/>
              <rect x="3" y="2" width="14" height="9" rx="2.5" fill={t.accent}/>
              <path d="M7 7l2 2 4-3.5" stroke={t.accentText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: 18, fontWeight: 400, letterSpacing: "-0.02em" }}>
            Cert<span style={{ color: t.accent }}>Stack</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="press" onClick={onSignIn} style={{
            padding: "7px 18px", borderRadius: 9, fontSize: 12, fontWeight: 700,
            background: t.bgSub, color: t.text, border: `1px solid ${t.border}`, transition: "all 160ms",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = t.bgCard; e.currentTarget.style.borderColor = t.borderStrong; }}
            onMouseLeave={e => { e.currentTarget.style.background = t.bgSub; e.currentTarget.style.borderColor = t.border; }}
          >Sign in</button>
          <button className="press shine-parent" onClick={onSignUp} style={{
            padding: "7px 18px", borderRadius: 9, fontSize: 12, fontWeight: 700,
            background: t.accent, color: t.accentText,
          }}>Get started →</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 860, margin: "0 auto", padding: "90px 40px 60px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7,
          padding: "5px 14px 5px 8px", borderRadius: 99,
          background: t.accentSoft, border: `1px solid ${t.accentBorder}`,
          marginBottom: 28, animation: "up 0.6s ease both" }}>
          <span style={{ width: 18, height: 18, borderRadius: 5, background: t.accent,
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="sparkle" size={10} color={t.accentText} />
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.accent, letterSpacing: "0.04em" }}>Open-source · RAG-powered · FE · PE · CPA · AWS</span>
        </div>

        <h1 style={{
          fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
          fontSize: "clamp(40px, 7vw, 70px)", fontWeight: 400,
          letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 20,
          animation: "heroSlide 0.7s ease 0.1s both",
        }}>
          Study smarter.<br />
          <span style={{ color: t.accent }}>Pass with confidence.</span>
        </h1>

        <p style={{ fontSize: 16, color: t.textSub, lineHeight: 1.75, maxWidth: 500,
          margin: "0 auto 36px", animation: "heroSubtitle 0.7s ease 0.2s both" }}>
          CertStack is a free, open-source prep platform for professional licensing exams —
          combining practice problems, AI-guided tutoring, and interactive study games.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", animation: "heroCta 0.7s ease 0.3s both" }}>
          <button className="press shine-parent" onClick={onSignUp} style={{
            padding: "13px 32px", borderRadius: 12, fontSize: 14, fontWeight: 800,
            background: t.accent, color: t.accentText, boxShadow: `0 4px 20px ${t.accent}40`,
          }}>Start for free →</button>
          <button className="press" onClick={onSignIn} style={{
            padding: "13px 28px", borderRadius: 12, fontSize: 14, fontWeight: 700,
            background: t.bgCard, color: t.text, border: `1px solid ${t.border}`,
          }}>Sign in</button>
        </div>
      </section>

      {/* Feature grid */}
      <section style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ textAlign: "center", marginBottom: 44 }}>
          <p style={{ fontSize: 10, color: t.textMuted, textTransform: "uppercase",
            letterSpacing: "0.18em", fontFamily: "'DM Mono', monospace", marginBottom: 10 }}>What's included</p>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: 36, fontWeight: 400, color: t.text, letterSpacing: "-0.02em" }}>Everything you need to pass</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {FEATURES.map((f, i) => (
            <Card key={i} t={t} s={{ padding: "22px", animation: `cardReveal 0.5s ease ${i * 70}ms both` }} className="lift">
              <div style={{ width: 42, height: 42, borderRadius: 11,
                background: `${t.s[f.color]}15`, border: `1px solid ${t.s[f.color]}28`,
                display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                <Icon name={f.icon} size={20} color={t.s[f.color]} />
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 800, color: t.text, marginBottom: 7 }}>{f.title}</h3>
              <p style={{ fontSize: 12, color: t.textSub, lineHeight: 1.65 }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: 860, margin: "0 auto 80px", padding: "0 40px" }}>
        <div style={{ borderRadius: 20, padding: "48px 44px", textAlign: "center",
          background: t.accentSoft, border: `1px solid ${t.accentBorder}` }}>
          <h2 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: 34, fontWeight: 400, color: t.text, letterSpacing: "-0.02em", marginBottom: 12 }}>Ready to start?</h2>
          <p style={{ fontSize: 13, color: t.textSub, marginBottom: 28, maxWidth: 380, margin: "0 auto 28px" }}>
            Free, open-source, and built by engineers who've sat these exams.
          </p>
          <button className="press shine-parent" onClick={onSignUp} style={{
            padding: "13px 34px", borderRadius: 12, fontSize: 14, fontWeight: 800,
            background: t.accent, color: t.accentText, boxShadow: `0 6px 24px ${t.accent}40`,
          }}>Create free account →</button>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${t.border}`, padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        maxWidth: 860, margin: "0 auto" }}>
        <span style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic", fontSize: 16, fontWeight: 400 }}>
          Cert<span style={{ color: t.accent }}>Stack</span>
        </span>
        <span style={{ fontSize: 11, color: t.textMuted, fontFamily: "'DM Mono', monospace" }}>
          Open source · RCOS 2025
        </span>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   AUTH PAGE
════════════════════════════════════════════════════════ */
function AuthPage({ t, mode, onAuth, onToggle }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const isSignUp = mode === "signup";

  const submit = () => { setLoading(true); setTimeout(() => { setLoading(false); onAuth(); }, 1200); };

  const InputField = ({ label, value, onChange, type = "text", icon, rightEl }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: t.textSub,
        display: "block", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em",
        fontFamily: "'DM Mono', monospace" }}>{label}</label>
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)",
            color: t.textMuted, pointerEvents: "none" }}>
            <Icon name={icon} size={14} color={t.textMuted} />
          </span>
        )}
        <input type={type} value={value} onChange={e => onChange(e.target.value)}
          style={{
            width: "100%", padding: icon ? "10px 12px 10px 36px" : "10px 12px",
            background: t.inputBg, border: `1.5px solid ${t.border}`,
            borderRadius: 10, fontSize: 13, color: t.text,
            fontFamily: "'DM Sans', sans-serif", outline: "none",
            transition: "border-color 150ms, box-shadow 150ms",
            paddingRight: rightEl ? 36 : 12,
          }}
          onFocus={e => { e.target.style.borderColor = t.accentBorder; e.target.style.boxShadow = `0 0 0 3px ${t.accent}18`; }}
          onBlur={e => { e.target.style.borderColor = t.border; e.target.style.boxShadow = "none"; }}
        />
        {rightEl && (
          <span style={{ position: "absolute", right: 11, top: "50%", transform: "translateY(-50%)", cursor: "pointer" }}>
            {rightEl}
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: t.bg, display: "flex", alignItems: "center",
      justifyContent: "center", padding: "40px 20px" }}>
      <div className="auth-panel" style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: t.accentSoft,
            border: `1px solid ${t.accentBorder}`, display: "flex", alignItems: "center",
            justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="26" height="26" viewBox="0 0 20 20" fill="none">
              <rect x="3" y="8" width="14" height="9" rx="2.5" fill={t.accent} opacity="0.15"/>
              <rect x="3" y="5" width="14" height="9" rx="2.5" fill={t.accent} opacity="0.3"/>
              <rect x="3" y="2" width="14" height="9" rx="2.5" fill={t.accent}/>
              <path d="M7 7l2 2 4-3.5" stroke={t.accentText} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h1 style={{ fontFamily: "'Instrument Serif', serif", fontStyle: "italic",
            fontSize: 28, fontWeight: 400, letterSpacing: "-0.02em", color: t.text }}>
            Cert<span style={{ color: t.accent }}>Stack</span>
          </h1>
          <p style={{ fontSize: 12, color: t.textSub, marginTop: 6 }}>Professional Exam Prep Platform</p>
        </div>

        <Card t={t} s={{ padding: "32px 28px" }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: t.text, marginBottom: 4, letterSpacing: "-0.01em" }}>
            {isSignUp ? "Create your account" : "Welcome back"}
          </h2>
          <p style={{ fontSize: 12, color: t.textSub, marginBottom: 24 }}>
            {isSignUp ? "Start studying smarter today." : "Sign in to continue your session."}
          </p>
          {isSignUp && <InputField label="Full name" value={name} onChange={setName} icon="user" />}
          <InputField label="Email" value={email} onChange={setEmail} type="email" icon="mail" />
          <InputField
            label="Password" value={pass} onChange={setPass}
            type={showPass ? "text" : "password"} icon="lock"
            rightEl={
              <button onClick={() => setShowPass(p => !p)} style={{ background: "none", border: "none", color: t.textMuted }}>
                <Icon name="eye" size={13} color={t.textMuted} />
              </button>
            }
          />
          <button className="press shine-parent" onClick={submit} disabled={loading} style={{
            width: "100%", marginTop: 8, padding: "12px", borderRadius: 11,
            fontSize: 14, fontWeight: 800, background: t.accent, color: t.accentText,
            opacity: loading ? 0.75 : 1, transition: "opacity 200ms",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}>
            {loading ? (
              <span style={{ display: "flex", gap: 4 }}>
                {[0,1,2].map(i => (
                  <span key={i} className="typing-dot" style={{
                    width: 6, height: 6, borderRadius: "50%", background: t.accentText, display: "inline-block" }} />
                ))}
              </span>
            ) : isSignUp ? "Create account →" : "Sign in →"}
          </button>
          <div style={{ textAlign: "center", marginTop: 18 }}>
            <span style={{ fontSize: 12, color: t.textSub }}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </span>{" "}
            <button onClick={onToggle} style={{
              background: "none", border: "none", fontSize: 12, color: t.accent,
              fontWeight: 700, cursor: "pointer", textDecoration: "underline",
              textDecorationColor: t.accentBorder,
            }}>{isSignUp ? "Sign in" : "Sign up"}</button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   ROOT APP
════════════════════════════════════════════════════════ */
export default function App() {
  const [tid, setTid] = useState("milk");
  const t = THEMES[tid];

  const [phase, setPhase] = useState("loading");
  const [screen, setScreen] = useState("app");
  const [authMode, setAuthMode] = useState("signin");

  const [page, setPage] = useState("dashboard");
  const [navVis, setNavVis] = useState(true);
  const [contentVis, setContentVis] = useState(false);
  const [palette, setPalette] = useState(false);

  useEffect(() => {
    const ts = [
      setTimeout(() => setPhase("exit"), 600),
      setTimeout(() => {
        setPhase("done");
        setTimeout(() => setContentVis(true), 100);
      }, 800),
    ];
    return () => ts.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setPalette(p => !p); }
      if (e.key === "Escape") setPalette(false);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const enterApp = () => {
    setScreen("app");
    setNavVis(true);
    setTimeout(() => setContentVis(true), 200);
  };

  const renderPage = () => {
    switch (page) {
      case "dashboard": return <DashboardPage t={t} vis={contentVis} setPage={setPage} />;
      case "subjects":  return <SubjectsPage t={t} setPage={setPage} />;
      case "study":     return <StudyPage t={t} />;
      case "quiz":      return <QuizPage t={t} />;
      case "speed":     return <SpeedRoundPage t={t} />;
      case "exams":     return <ExamsPage t={t} setPage={setPage} />;
      case "settings":  return <SettingsPage t={t} themeId={tid} setThemeId={setTid} />;
      default: return null;
    }
  };

  return (
    <div className="theme-root" style={{ height: "100vh", background: t.bg, color: t.text, overflow: "hidden" }}>
      <G t={t} />

      {phase !== "done" && <Loader t={t} exiting={phase === "exit"} />}

      {phase === "done" && screen === "landing" && (
        <div style={{ height: "100vh", overflow: "auto" }}>
          <LandingPage t={t}
            onSignIn={() => { setAuthMode("signin"); setScreen("auth"); }}
            onSignUp={() => { setAuthMode("signup"); setScreen("auth"); }}
          />
        </div>
      )}

      {phase === "done" && screen === "auth" && (
        <div style={{ height: "100vh", overflow: "auto" }}>
          <AuthPage t={t} mode={authMode} onAuth={enterApp}
            onToggle={() => setAuthMode(m => m === "signin" ? "signup" : "signin")} />
        </div>
      )}

      {phase === "done" && screen === "app" && (
        <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
          <Sidebar t={t} active={page} setActive={setPage} vis={navVis} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
            opacity: contentVis ? 1 : 0, transition: "opacity 0.4s ease" }}>
            <Topbar t={t} page={page} onSearch={() => setPalette(true)}
              vis={contentVis} themeId={tid} setThemeId={setTid} setPage={setPage} />
            <main style={{ flex: 1, overflow: "auto", padding: "26px 28px" }}>
              <div style={{ maxWidth: 1100, margin: "0 auto" }}>
                {renderPage()}
              </div>
            </main>
          </div>
          {palette && <Palette t={t} onClose={() => setPalette(false)} setPage={setPage} />}
        </div>
      )}
    </div>
  );
}

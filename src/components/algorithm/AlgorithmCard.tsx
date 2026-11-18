/**
 * AlgorithmCard.tsx
 * BrainSort — Tarjeta premium de algoritmo para la biblioteca.
 */

import React, { useCallback, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Line,
  Marker,
  Path,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import { useThemeContext } from '../../context/ThemeContext';
import { AlgoritmoEnBiblioteca } from '../../services/library.service';
import { AlgoritmoProgreso } from '../../services/progress.service';
import {
  DifficultyBadge,
  normalizeDificultad,
} from './DifficultyBadge';
import { Accent, SimulationColors } from '../../styles/colors';
import { BorderRadius, Spacing } from '../../styles/spacing';
import { FontFamilies, FontSizes, FontWeights } from '../../styles/typography';

export interface AlgorithmCardProps {
  algoritmo: AlgoritmoEnBiblioteca;
  onPress: (algoritmo: AlgoritmoEnBiblioteca) => void;
  progreso?: AlgoritmoProgreso;
}

const CATEGORY_LABELS: Record<string, string> = {
  Ordenamiento: 'Ordenamiento',
  Busqueda: 'Búsqueda',
  EstructurasLineales: 'Estructuras lineales',
  EstructurasArboles: 'Estructuras de árboles',
  Grafos: 'Grafos',
};

function AlgorithmArt({ name, isDark }: { name: string; isDark: boolean }) {
  const key = name.trim().toLowerCase();

  const idle = SimulationColors.idle;
  const cmp = SimulationColors.comparacion;
  const swap = SimulationColors.intercambio;
  const done = SimulationColors.final;
  const cyan = Accent[500];

  const ink = isDark ? '#E2F1F8' : '#0F172A';
  const muted = isDark ? '#64748B' : '#94A3B8';
  const subtleLine = isDark
    ? 'rgba(148, 163, 184, 0.30)'
    : 'rgba(100, 116, 139, 0.32)';
  const nodeFill = isDark ? '#0B1624' : '#FFFFFF';
  const badgeBg = isDark ? 'rgba(15, 23, 42, 0.94)' : '#FFFFFF';

  // 1. Bubble Sort
  if (key.includes('bubble')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker
            id="mBubbleSwap"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <Path d="M0 0 L6 3 L0 6 Z" fill={cmp} />
          </Marker>
        </Defs>
        <Line
          x1="14"
          y1="66"
          x2="186"
          y2="66"
          stroke={subtleLine}
          strokeWidth={1.2}
        />
        <Rect x="22" y="48" width="18" height="18" rx="3" fill={idle} opacity={0.85} />
        <Rect x="48" y="40" width="18" height="26" rx="3" fill={idle} opacity={0.85} />
        {/* Active comparison capsule */}
        <Rect
          x="70"
          y="22"
          width="54"
          height="47"
          rx="7"
          fill="rgba(245, 166, 35, 0.10)"
          stroke={cmp}
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />
        <Rect x="75" y="28" width="18" height="38" rx="3" fill={cmp} />
        <Rect x="101" y="34" width="18" height="32" rx="3" fill={swap} />
        <Path
          d="M84 20 C90 10, 104 10, 110 20"
          stroke={cmp}
          strokeWidth={1.5}
          fill="none"
          markerEnd="url(#mBubbleSwap)"
        />
        {/* Sorted rightmost bars */}
        <Rect x="132" y="20" width="18" height="46" rx="3" fill={done} />
        <Rect x="158" y="12" width="18" height="54" rx="3" fill={done} />
      </Svg>
    );
  }

  // 2. Insertion Sort
  if (key.includes('insertion')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker
            id="mInsertArrow"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <Path d="M0 0 L6 3 L0 6 Z" fill={cmp} />
          </Marker>
        </Defs>
        <Line
          x1="14"
          y1="66"
          x2="186"
          y2="66"
          stroke={subtleLine}
          strokeWidth={1.2}
        />
        {/* Sorted partition */}
        <Rect x="20" y="46" width="17" height="20" rx="3" fill={done} />
        <Rect x="43" y="36" width="17" height="30" rx="3" fill={done} />
        <Rect x="66" y="24" width="17" height="42" rx="3" fill={done} />
        <Line
          x1="91"
          y1="12"
          x2="91"
          y2="68"
          stroke={cyan}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        {/* Target gap */}
        <Rect
          x="99"
          y="38"
          width="17"
          height="28"
          rx="3"
          fill="none"
          stroke={cmp}
          strokeWidth={1.2}
          strokeDasharray="3 2"
        />
        {/* Elevated active bar + insertion curve */}
        <Rect x="124" y="8" width="17" height="28" rx="3" fill={cmp} />
        <Path
          d="M124 22 C112 22, 108 28, 108 35"
          stroke={cmp}
          strokeWidth={1.6}
          fill="none"
          markerEnd="url(#mInsertArrow)"
        />
        {/* Unsorted remaining */}
        <Rect x="132" y="42" width="17" height="24" rx="3" fill={idle} opacity={0.85} />
        <Rect x="157" y="18" width="17" height="48" rx="3" fill={idle} opacity={0.85} />
      </Svg>
    );
  }

  // 3. Selection Sort
  if (key.includes('selection')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker
            id="mSelectSwap"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <Path d="M0 0 L6 3 L0 6 Z" fill={cmp} />
          </Marker>
        </Defs>
        {/* Bars */}
        <Rect x="20" y="38" width="18" height="22" rx="3" fill={done} />
        <Rect x="46" y="24" width="18" height="36" rx="3" fill={idle} opacity={0.85} />
        <Rect x="72" y="18" width="18" height="42" rx="3" fill={idle} opacity={0.85} />
        <Rect x="98" y="42" width="18" height="18" rx="3" fill={cmp} />
        <Rect x="124" y="28" width="18" height="32" rx="3" fill={idle} opacity={0.85} />
        <Rect x="150" y="14" width="18" height="46" rx="3" fill={idle} opacity={0.85} />
        {/* MIN badge */}
        <Rect x="95" y="24" width="24" height="13" rx="4" fill={badgeBg} stroke={cmp} strokeWidth={1} />
        <SvgText x="107" y="33.5" fill={cmp} fontSize="7.5" fontWeight="700" textAnchor="middle">
          MIN
        </SvgText>
        {/* Curved swap arc to front slot */}
        <Path
          d="M107 24 C95 8, 66 8, 56 21"
          stroke={cmp}
          strokeWidth={1.5}
          fill="none"
          markerEnd="url(#mSelectSwap)"
        />
        {/* Bottom scan range bracket */}
        <Path
          d="M46 64 V69 H168 V64"
          stroke={cyan}
          strokeWidth={1.3}
          fill="none"
        />
      </Svg>
    );
  }

  // 4. Merge Sort
  if (key.includes('merge')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker
            id="mMergeConv"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <Path d="M0 0 L6 3 L0 6 Z" fill={cyan} />
          </Marker>
        </Defs>
        {/* Top left sorted subarray */}
        <Rect x="22" y="8" width="28" height="18" rx="3" fill={nodeFill} stroke={cyan} strokeWidth={1.3} />
        <Rect x="52" y="8" width="28" height="18" rx="3" fill={nodeFill} stroke={cyan} strokeWidth={1.3} />
        <SvgText x="36" y="20" fill={ink} fontSize="9.5" fontWeight="700" textAnchor="middle">14</SvgText>
        <SvgText x="66" y="20" fill={ink} fontSize="9.5" fontWeight="700" textAnchor="middle">38</SvgText>

        {/* Top right sorted subarray */}
        <Rect x="120" y="8" width="28" height="18" rx="3" fill={nodeFill} stroke={cyan} strokeWidth={1.3} />
        <Rect x="150" y="8" width="28" height="18" rx="3" fill={nodeFill} stroke={cyan} strokeWidth={1.3} />
        <SvgText x="134" y="20" fill={ink} fontSize="9.5" fontWeight="700" textAnchor="middle">21</SvgText>
        <SvgText x="164" y="20" fill={ink} fontSize="9.5" fontWeight="700" textAnchor="middle">52</SvgText>

        {/* Converging arrows */}
        <Path d="M51 28 L82 44" stroke={cyan} strokeWidth={1.4} fill="none" markerEnd="url(#mMergeConv)" />
        <Path d="M149 28 L118 44" stroke={cyan} strokeWidth={1.4} fill="none" markerEnd="url(#mMergeConv)" />

        {/* Unified sorted 4-cell bottom array */}
        {[
          { x: 42, val: '14' },
          { x: 71, val: '21' },
          { x: 100, val: '38' },
          { x: 129, val: '52' },
        ].map((c) => (
          <G key={c.val}>
            <Rect
              x={c.x}
              y="48"
              width="27"
              height="20"
              rx="3"
              fill="rgba(126, 211, 33, 0.16)"
              stroke={done}
              strokeWidth={1.4}
            />
            <SvgText
              x={c.x + 13.5}
              y="61"
              fill={ink}
              fontSize="9.5"
              fontWeight="700"
              textAnchor="middle"
            >
              {c.val}
            </SvgText>
          </G>
        ))}
      </Svg>
    );
  }

  // 5. Quick Sort
  if (key.includes('quick')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        {/* Dashed vertical pivot axis */}
        <Line
          x1="100"
          y1="6"
          x2="100"
          y2="70"
          stroke={cmp}
          strokeWidth={1.2}
          strokeDasharray="3 3"
        />
        {/* Pivot pillar */}
        <Rect x="91" y="22" width="18" height="44" rx="3" fill={cmp} />
        <Circle cx="100" cy="12" r="7.5" fill={badgeBg} stroke={cmp} strokeWidth={1.3} />
        <SvgText x="100" y="15" fill={cmp} fontSize="8.5" fontWeight="800" textAnchor="middle">
          P
        </SvgText>

        {/* Left partition (< P) */}
        <Rect x="20" y="44" width="16" height="22" rx="3" fill={idle} />
        <Rect x="42" y="36" width="16" height="30" rx="3" fill={idle} />
        <Rect x="64" y="50" width="16" height="16" rx="3" fill={idle} />
        <SvgText x="50" y="22" fill={idle} fontSize="9" fontWeight="700" textAnchor="middle">
          {'< P'}
        </SvgText>

        {/* Right partition (> P) */}
        <Rect x="120" y="24" width="16" height="42" rx="3" fill={done} />
        <Rect x="142" y="18" width="16" height="48" rx="3" fill={done} />
        <Rect x="164" y="12" width="16" height="54" rx="3" fill={done} />
        <SvgText x="150" y="22" fill={done} fontSize="9" fontWeight="700" textAnchor="middle">
          {'> P'}
        </SvgText>
      </Svg>
    );
  }

  // 6. Heap Sort
  if (key.includes('heap')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker
            id="mHeapExtract"
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <Path d="M0 0 L6 3 L0 6 Z" fill={done} />
          </Marker>
        </Defs>
        {/* Tree edges */}
        <Line x1="54" y1="16" x2="32" y2="38" stroke={subtleLine} strokeWidth={1.4} />
        <Line x1="54" y1="16" x2="76" y2="38" stroke={subtleLine} strokeWidth={1.4} />
        <Line x1="32" y1="38" x2="20" y2="60" stroke={subtleLine} strokeWidth={1.3} />
        <Line x1="32" y1="38" x2="44" y2="60" stroke={subtleLine} strokeWidth={1.3} />
        <Line x1="76" y1="38" x2="88" y2="60" stroke={subtleLine} strokeWidth={1.3} />

        {/* Heap nodes */}
        <Circle cx="54" cy="16" r="9" fill={swap} />
        <Circle cx="32" cy="38" r="8" fill={cmp} />
        <Circle cx="76" cy="38" r="8" fill={idle} />
        <Circle cx="20" cy="60" r="6.5" fill={idle} />
        <Circle cx="44" cy="60" r="6.5" fill={idle} />
        <Circle cx="88" cy="60" r="6.5" fill={idle} />

        {/* Extraction arrow */}
        <Path
          d="M68 16 C92 14, 106 20, 118 32"
          stroke={done}
          strokeWidth={1.6}
          fill="none"
          markerEnd="url(#mHeapExtract)"
        />

        {/* Sorted bars on the right */}
        <Line x1="120" y1="66" x2="186" y2="66" stroke={subtleLine} strokeWidth={1.2} />
        <Rect x="124" y="44" width="14" height="22" rx="2.5" fill={done} />
        <Rect x="144" y="32" width="14" height="34" rx="2.5" fill={done} />
        <Rect x="164" y="18" width="14" height="48" rx="2.5" fill={done} />
      </Svg>
    );
  }

  // 7. Linear Search
  if (key.includes('linear')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker
            id="mLinearTrail"
            markerWidth="5"
            markerHeight="5"
            refX="4"
            refY="2.5"
            orient="auto"
          >
            <Path d="M0 0 L5 2.5 L0 5 Z" fill={cmp} />
          </Marker>
        </Defs>
        {/* Sequential scan trail */}
        <Path
          d="M27 25 C36 14, 46 14, 54 25"
          stroke={idle}
          strokeWidth={1.3}
          fill="none"
        />
        <Path
          d="M55 25 C64 14, 74 14, 82 25"
          stroke={cmp}
          strokeWidth={1.4}
          fill="none"
        />
        <Path
          d="M83 25 C92 14, 102 14, 109 25"
          stroke={cmp}
          strokeWidth={1.4}
          fill="none"
          markerEnd="url(#mLinearTrail)"
        />
        {/* 6 array cells */}
        <Rect x="16" y="30" width="23" height="23" rx="4" fill={nodeFill} stroke={idle} strokeWidth={1.4} />
        <Rect x="44" y="30" width="23" height="23" rx="4" fill={nodeFill} stroke={idle} strokeWidth={1.4} />
        <Rect x="72" y="30" width="23" height="23" rx="4" fill="rgba(245, 166, 35, 0.16)" stroke={cmp} strokeWidth={1.5} />
        <Rect x="100" y="30" width="23" height="23" rx="4" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.8} />
        <Rect x="128" y="30" width="23" height="23" rx="4" fill={nodeFill} stroke={subtleLine} strokeWidth={1.2} opacity={0.55} />
        <Rect x="156" y="30" width="23" height="23" rx="4" fill={nodeFill} stroke={subtleLine} strokeWidth={1.2} opacity={0.55} />
        {/* Magnifying glass reticle on target cell */}
        <Circle cx="111.5" cy="41.5" r="14" fill="none" stroke={cyan} strokeWidth={1.6} />
        <Line x1="121.5" y1="51.5" x2="132" y2="62" stroke={cyan} strokeWidth={2.2} strokeLinecap="round" />
      </Svg>
    );
  }

  // 8. Binary Search
  if (key.includes('binary search') && !key.includes('tree')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        {/* Halving arcs */}
        <Path d="M27 24 C50 8, 76 8, 96 24" stroke={cyan} strokeWidth={1.3} fill="none" strokeDasharray="3 2" />
        <Path d="M173 24 C150 8, 124 8, 104 24" stroke={cyan} strokeWidth={1.3} fill="none" strokeDasharray="3 2" />
        {/* 7 sorted cells */}
        {[0, 1, 2, 3, 4, 5, 6].map((i) => {
          const x = 16 + i * 24;
          const isMid = i === 3;
          const isActiveRange = i >= 2 && i <= 4;
          return (
            <Rect
              key={i}
              x={x}
              y="28"
              width="21"
              height="23"
              rx="4"
              fill={
                isMid
                  ? 'rgba(126, 211, 33, 0.22)'
                  : isActiveRange
                    ? nodeFill
                    : 'transparent'
              }
              stroke={isMid ? done : isActiveRange ? idle : subtleLine}
              strokeWidth={isMid ? 1.8 : 1.3}
              opacity={isActiveRange ? 1 : 0.35}
            />
          );
        })}
        {/* L, M, R labels */}
        <SvgText x="74.5" y="64" fill={idle} fontSize="8.5" fontWeight="700" textAnchor="middle">L</SvgText>
        <SvgText x="98.5" y="64" fill={done} fontSize="9" fontWeight="800" textAnchor="middle">M</SvgText>
        <SvgText x="122.5" y="64" fill={idle} fontSize="8.5" fontWeight="700" textAnchor="middle">R</SvgText>
      </Svg>
    );
  }

  // 9. Stack
  if (key.includes('stack') || key.includes('pila')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker id="mStackPush" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={done} />
          </Marker>
          <Marker id="mStackPop" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={cmp} />
          </Marker>
        </Defs>
        {/* U-shaped LIFO container */}
        <Path
          d="M70 22 V66 H130 V22"
          stroke={cyan}
          strokeWidth={1.8}
          fill="none"
          strokeLinecap="round"
        />
        {/* 3 stacked blocks */}
        <Rect x="76" y="51" width="48" height="11" rx="2.5" fill={idle} />
        <Rect x="76" y="37" width="48" height="11" rx="2.5" fill={cyan} opacity={0.85} />
        <Rect x="76" y="13" width="48" height="11" rx="2.5" fill={cmp} />
        {/* PUSH & POP arrows */}
        <Path
          d="M36 16 C52 10, 62 14, 72 22"
          stroke={done}
          strokeWidth={1.6}
          fill="none"
          markerEnd="url(#mStackPush)"
        />
        <SvgText x="26" y="32" fill={done} fontSize="7.5" fontWeight="700">PUSH</SvgText>
        <Path
          d="M128 22 C138 14, 148 10, 164 16"
          stroke={cmp}
          strokeWidth={1.6}
          fill="none"
          markerEnd="url(#mStackPop)"
        />
        <SvgText x="155" y="32" fill={cmp} fontSize="7.5" fontWeight="700">POP</SvgText>
      </Svg>
    );
  }

  // 10. Priority Queue
  if (key.includes('priority')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker id="mPriorityOut" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={done} />
          </Marker>
        </Defs>
        {/* TOP priority badge */}
        <Rect x="16" y="10" width="26" height="13" rx="4" fill={badgeBg} stroke={done} strokeWidth={1} />
        <SvgText x="29" y="19.5" fill={done} fontSize="7.5" fontWeight="800" textAnchor="middle">
          TOP
        </SvgText>
        {/* Extraction arrow */}
        <Path d="M44 38 H18" stroke={done} strokeWidth={1.8} fill="none" markerEnd="url(#mPriorityOut)" />
        {/* Prioritized items [9] > [6] > [3] */}
        <Rect x="50" y="23" width="32" height="30" rx="5" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.7} />
        <SvgText x="66" y="42" fill={ink} fontSize="11" fontWeight="800" textAnchor="middle">9</SvgText>
        <SvgText x="91" y="41" fill={muted} fontSize="10" fontWeight="700" textAnchor="middle">{'>'}</SvgText>

        <Rect x="100" y="25" width="28" height="26" rx="5" fill="rgba(245, 166, 35, 0.16)" stroke={cmp} strokeWidth={1.5} />
        <SvgText x="114" y="42" fill={ink} fontSize="10" fontWeight="700" textAnchor="middle">6</SvgText>
        <SvgText x="137" y="41" fill={muted} fontSize="10" fontWeight="700" textAnchor="middle">{'>'}</SvgText>

        <Rect x="146" y="27" width="26" height="22" rx="5" fill={nodeFill} stroke={idle} strokeWidth={1.4} />
        <SvgText x="159" y="42" fill={ink} fontSize="9.5" fontWeight="700" textAnchor="middle">3</SvgText>

        <SvgText x="111" y="66" fill={cyan} fontSize="7.5" fontWeight="700" textAnchor="middle">
          MAX PRIORITY
        </SvgText>
      </Svg>
    );
  }

  // 11. Queue
  if (key.includes('queue') && !key.includes('deque') && !key.includes('priority')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker id="mQueueIn" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={cmp} />
          </Marker>
          <Marker id="mQueueOut" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={done} />
          </Marker>
        </Defs>
        {/* Horizontal FIFO rails */}
        <Line x1="40" y1="22" x2="160" y2="22" stroke={cyan} strokeWidth={1.6} />
        <Line x1="40" y1="52" x2="160" y2="52" stroke={cyan} strokeWidth={1.6} />
        {/* 4 queued blocks */}
        <Rect x="46" y="27" width="24" height="20" rx="3" fill={done} />
        <Rect x="74" y="27" width="24" height="20" rx="3" fill={cyan} opacity={0.85} />
        <Rect x="102" y="27" width="24" height="20" rx="3" fill={idle} />
        <Rect x="130" y="27" width="24" height="20" rx="3" fill={cmp} />
        {/* OUT front */}
        <Path d="M36 37 H14" stroke={done} strokeWidth={1.8} fill="none" markerEnd="url(#mQueueOut)" />
        <SvgText x="23" y="64" fill={done} fontSize="7.5" fontWeight="700" textAnchor="middle">OUT</SvgText>
        {/* IN rear */}
        <Path d="M186 37 H164" stroke={cmp} strokeWidth={1.8} fill="none" markerEnd="url(#mQueueIn)" />
        <SvgText x="176" y="64" fill={cmp} fontSize="7.5" fontWeight="700" textAnchor="middle">IN</SvgText>
      </Svg>
    );
  }

  // 11. Deque
  if (key.includes('deque')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker id="mDequeL" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <Path d="M0 0 L5 2.5 L0 5 Z" fill={cyan} />
          </Marker>
          <Marker id="mDequeR" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto">
            <Path d="M0 0 L5 2.5 L0 5 Z" fill={done} />
          </Marker>
        </Defs>
        {/* Double-ended channel */}
        <Line x1="48" y1="22" x2="152" y2="22" stroke={cyan} strokeWidth={1.6} />
        <Line x1="48" y1="52" x2="152" y2="52" stroke={cyan} strokeWidth={1.6} />
        {/* 3 blocks */}
        <Rect x="56" y="27" width="26" height="20" rx="3" fill={cyan} opacity={0.85} />
        <Rect x="87" y="27" width="26" height="20" rx="3" fill={idle} />
        <Rect x="118" y="27" width="26" height="20" rx="3" fill={done} />
        {/* Bidirectional left (FRONT) */}
        <Path d="M14 32 H42" stroke={cyan} strokeWidth={1.5} markerEnd="url(#mDequeL)" />
        <Path d="M42 42 H14" stroke={cyan} strokeWidth={1.5} markerEnd="url(#mDequeL)" />
        <SvgText x="28" y="64" fill={cyan} fontSize="7.5" fontWeight="700" textAnchor="middle">FRONT</SvgText>
        {/* Bidirectional right (REAR) */}
        <Path d="M158 32 H186" stroke={done} strokeWidth={1.5} markerEnd="url(#mDequeR)" />
        <Path d="M186 42 H158" stroke={done} strokeWidth={1.5} markerEnd="url(#mDequeR)" />
        <SvgText x="172" y="64" fill={done} fontSize="7.5" fontWeight="700" textAnchor="middle">REAR</SvgText>
      </Svg>
    );
  }

  // 12. Linked List
  if (key.includes('linked')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker id="mLinkedPtr" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={cyan} />
          </Marker>
        </Defs>
        {[
          { x: 14, color: idle, val: '12' },
          { x: 68, color: cmp, val: '27' },
          { x: 122, color: done, val: '45' },
        ].map((n) => (
          <G key={n.val}>
            <Rect
              x={n.x}
              y="26"
              width="38"
              height="24"
              rx="5"
              fill={nodeFill}
              stroke={n.color}
              strokeWidth={1.5}
            />
            <Line
              x1={n.x + 24}
              y1="26"
              x2={n.x + 24}
              y2="50"
              stroke={n.color}
              strokeWidth={1.2}
            />
            <SvgText
              x={n.x + 12}
              y="41.5"
              fill={ink}
              fontSize="9.5"
              fontWeight="700"
              textAnchor="middle"
            >
              {n.val}
            </SvgText>
            <Circle cx={n.x + 31} cy="38" r="2.6" fill={n.color} />
          </G>
        ))}
        {/* Pointer arrows */}
        <Path d="M52 38 H66" stroke={cyan} strokeWidth={1.5} markerEnd="url(#mLinkedPtr)" />
        <Path d="M106 38 H120" stroke={cyan} strokeWidth={1.5} markerEnd="url(#mLinkedPtr)" />
        <Path d="M160 38 H174" stroke={muted} strokeWidth={1.4} />
        {/* NULL ground symbol */}
        <Line x1="174" y1="31" x2="174" y2="45" stroke={muted} strokeWidth={1.6} />
        <Line x1="178" y1="34" x2="178" y2="42" stroke={muted} strokeWidth={1.4} />
        <SvgText x="180" y="57" fill={muted} fontSize="7" fontWeight="700" textAnchor="middle">
          NULL
        </SvgText>
      </Svg>
    );
  }

  // 13. Binary Search Tree / BST
  if (key.includes('binary search tree') || key === 'bst') {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        {/* Edges */}
        <Line x1="100" y1="15" x2="56" y2="38" stroke={subtleLine} strokeWidth={1.4} />
        <Line x1="56" y1="38" x2="34" y2="61" stroke={subtleLine} strokeWidth={1.3} />
        <Line x1="56" y1="38" x2="78" y2="61" stroke={subtleLine} strokeWidth={1.3} />
        <Line x1="144" y1="38" x2="166" y2="61" stroke={subtleLine} strokeWidth={1.3} />
        {/* Highlighted search path 8 -> 12 -> 10 */}
        <Line x1="100" y1="15" x2="144" y2="38" stroke={cmp} strokeWidth={2} />
        <Line x1="144" y1="38" x2="122" y2="61" stroke={done} strokeWidth={2} />

        {/* Nodes */}
        <Circle cx="100" cy="15" r="9" fill={nodeFill} stroke={cyan} strokeWidth={1.8} />
        <SvgText x="100" y="18.5" fill={ink} fontSize="9" fontWeight="700" textAnchor="middle">8</SvgText>

        <Circle cx="56" cy="38" r="8" fill={nodeFill} stroke={idle} strokeWidth={1.4} />
        <SvgText x="56" y="41" fill={ink} fontSize="8.5" fontWeight="700" textAnchor="middle">4</SvgText>

        <Circle cx="144" cy="38" r="8.5" fill={nodeFill} stroke={cmp} strokeWidth={1.8} />
        <SvgText x="144" y="41" fill={ink} fontSize="8.5" fontWeight="700" textAnchor="middle">12</SvgText>

        <Circle cx="34" cy="61" r="7.5" fill={nodeFill} stroke={subtleLine} strokeWidth={1.2} />
        <SvgText x="34" y="64" fill={muted} fontSize="8" fontWeight="700" textAnchor="middle">2</SvgText>

        <Circle cx="78" cy="61" r="7.5" fill={nodeFill} stroke={subtleLine} strokeWidth={1.2} />
        <SvgText x="78" y="64" fill={muted} fontSize="8" fontWeight="700" textAnchor="middle">6</SvgText>

        <Circle cx="122" cy="61" r="8.5" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.8} />
        <SvgText x="122" y="64" fill={ink} fontSize="8" fontWeight="800" textAnchor="middle">10</SvgText>

        <Circle cx="166" cy="61" r="7.5" fill={nodeFill} stroke={subtleLine} strokeWidth={1.2} />
        <SvgText x="166" y="64" fill={muted} fontSize="8" fontWeight="700" textAnchor="middle">14</SvgText>
      </Svg>
    );
  }

  // 14. Segment Tree
  if (key.includes('segment')) {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        {/* Edges */}
        <Line x1="100" y1="22" x2="56" y2="30" stroke={subtleLine} strokeWidth={1.3} />
        <Line x1="100" y1="22" x2="144" y2="30" stroke={subtleLine} strokeWidth={1.3} />
        {[26, 56, 84].map((lx) => (
          <Line key={`l-${lx}`} x1="56" y1="45" x2={lx} y2="55" stroke={subtleLine} strokeWidth={1.2} />
        ))}
        {[116, 144, 174].map((rx) => (
          <Line key={`r-${rx}`} x1="144" y1="45" x2={rx} y2="55" stroke={subtleLine} strokeWidth={1.2} />
        ))}
        {/* Top [0..5] */}
        <Rect x="58" y="6" width="84" height="16" rx="4" fill="rgba(0, 212, 255, 0.16)" stroke={cyan} strokeWidth={1.5} />
        <SvgText x="100" y="17" fill={ink} fontSize="8.5" fontWeight="700" textAnchor="middle">[0..5]</SvgText>
        {/* Middle [0..2] and [3..5] */}
        <Rect x="22" y="30" width="68" height="15" rx="3.5" fill="rgba(245, 166, 35, 0.16)" stroke={cmp} strokeWidth={1.4} />
        <SvgText x="56" y="40.5" fill={ink} fontSize="8" fontWeight="700" textAnchor="middle">[0..2]</SvgText>
        <Rect x="110" y="30" width="68" height="15" rx="3.5" fill="rgba(126, 211, 33, 0.16)" stroke={done} strokeWidth={1.4} />
        <SvgText x="144" y="40.5" fill={ink} fontSize="8" fontWeight="700" textAnchor="middle">[3..5]</SvgText>
        {/* 6 leaf cells */}
        {[16, 46, 74, 106, 134, 164].map((x, idx) => (
          <Rect
            key={x}
            x={x}
            y="55"
            width="20"
            height="14"
            rx="2.5"
            fill={nodeFill}
            stroke={idx < 3 ? cmp : done}
            strokeWidth={1.2}
          />
        ))}
      </Svg>
    );
  }

  // 15. Breadth-First Search (BFS)
  if (key.includes('breadth') || key === 'bfs') {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        {/* Concentric wave rings */}
        <Path d="M74 12 A56 56 0 0 1 74 64" stroke={cyan} strokeWidth={1.2} strokeDasharray="3 3" fill="none" />
        <Path d="M128 8 A92 92 0 0 1 128 68" stroke={cmp} strokeWidth={1.2} strokeDasharray="3 3" fill="none" />
        {/* Graph edges */}
        <Line x1="36" y1="38" x2="92" y2="20" stroke={cyan} strokeWidth={1.5} />
        <Line x1="36" y1="38" x2="92" y2="56" stroke={cyan} strokeWidth={1.5} />
        <Line x1="92" y1="20" x2="154" y2="16" stroke={cmp} strokeWidth={1.4} />
        <Line x1="92" y1="20" x2="162" y2="38" stroke={cmp} strokeWidth={1.4} />
        <Line x1="92" y1="56" x2="154" y2="60" stroke={cmp} strokeWidth={1.4} />
        {/* Source node */}
        <Circle cx="36" cy="38" r="9.5" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.8} />
        <SvgText x="36" y="41.5" fill={ink} fontSize="9" fontWeight="800" textAnchor="middle">S</SvgText>
        {/* Level 1 */}
        <Circle cx="92" cy="20" r="8" fill={nodeFill} stroke={cyan} strokeWidth={1.7} />
        <Circle cx="92" cy="56" r="8" fill={nodeFill} stroke={cyan} strokeWidth={1.7} />
        {/* Level 2 frontier */}
        <Circle cx="154" cy="16" r="7.5" fill={nodeFill} stroke={cmp} strokeWidth={1.6} />
        <Circle cx="162" cy="38" r="7.5" fill={nodeFill} stroke={cmp} strokeWidth={1.6} />
        <Circle cx="154" cy="60" r="7.5" fill={nodeFill} stroke={cmp} strokeWidth={1.6} />
      </Svg>
    );
  }

  // 16. Depth-First Search (DFS)
  if (key.includes('depth') || key === 'dfs') {
    return (
      <Svg viewBox="0 0 200 76" style={styles.artSvg}>
        <Defs>
          <Marker id="mDfsBack" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
            <Path d="M0 0 L6 3 L0 6 Z" fill={cyan} />
          </Marker>
        </Defs>
        {/* Deep traversal chain */}
        <Line x1="28" y1="38" x2="76" y2="20" stroke={done} strokeWidth={1.8} />
        <Line x1="76" y1="20" x2="126" y2="20" stroke={cmp} strokeWidth={1.8} />
        <Line x1="126" y1="20" x2="170" y2="32" stroke={swap} strokeWidth={1.8} />
        {/* Unvisited branch */}
        <Line x1="76" y1="20" x2="76" y2="58" stroke={subtleLine} strokeWidth={1.4} />
        <Line x1="76" y1="58" x2="132" y2="58" stroke={subtleLine} strokeWidth={1.4} />
        {/* Dashed backtrack arc */}
        <Path
          d="M126 30 C114 44, 98 46, 86 30"
          stroke={cyan}
          strokeWidth={1.4}
          strokeDasharray="3 2"
          fill="none"
          markerEnd="url(#mDfsBack)"
        />
        {/* Nodes */}
        <Circle cx="28" cy="38" r="8.5" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.8} />
        <Circle cx="76" cy="20" r="8.5" fill={nodeFill} stroke={cmp} strokeWidth={1.8} />
        <Circle cx="126" cy="20" r="8.5" fill={nodeFill} stroke={swap} strokeWidth={1.8} />
        <Circle cx="170" cy="32" r="8.5" fill="rgba(208, 2, 27, 0.20)" stroke={swap} strokeWidth={1.8} />
        <Circle cx="76" cy="58" r="7.5" fill={nodeFill} stroke={idle} strokeWidth={1.5} />
        <Circle cx="132" cy="58" r="7.5" fill={nodeFill} stroke={idle} strokeWidth={1.5} />
      </Svg>
    );
  }

  // 17. Dijkstra
  return (
    <Svg viewBox="0 0 200 76" style={styles.artSvg}>
      <Defs>
        <Marker id="mDijkPath" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
          <Path d="M0 0 L6 3 L0 6 Z" fill={done} />
        </Marker>
      </Defs>
      {/* Non-optimal edges */}
      <Line x1="28" y1="38" x2="82" y2="58" stroke={subtleLine} strokeWidth={1.4} />
      <Line x1="82" y1="58" x2="172" y2="42" stroke={subtleLine} strokeWidth={1.4} />
      {/* Glowing shortest path S -> A -> C -> T */}
      <Line x1="28" y1="38" x2="82" y2="18" stroke={done} strokeWidth={2.2} />
      <Line x1="82" y1="18" x2="136" y2="24" stroke={done} strokeWidth={2.2} />
      <Line x1="136" y1="24" x2="164" y2="38" stroke={done} strokeWidth={2.2} markerEnd="url(#mDijkPath)" />

      {/* Edge weight badges */}
      <Rect x="45" y="18" width="14" height="12" rx="3" fill={badgeBg} stroke={done} strokeWidth={1} />
      <SvgText x="52" y="27" fill={done} fontSize="8" fontWeight="700" textAnchor="middle">2</SvgText>

      <Rect x="102" y="13" width="14" height="12" rx="3" fill={badgeBg} stroke={done} strokeWidth={1} />
      <SvgText x="109" y="22" fill={done} fontSize="8" fontWeight="700" textAnchor="middle">1</SvgText>

      <Rect x="148" y="18" width="14" height="12" rx="3" fill={badgeBg} stroke={done} strokeWidth={1} />
      <SvgText x="155" y="27" fill={done} fontSize="8" fontWeight="700" textAnchor="middle">3</SvgText>

      <Rect x="47" y="45" width="14" height="12" rx="3" fill={badgeBg} stroke={subtleLine} strokeWidth={1} />
      <SvgText x="54" y="54" fill={muted} fontSize="8" fontWeight="700" textAnchor="middle">6</SvgText>

      {/* Nodes */}
      <Circle cx="28" cy="38" r="9" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.8} />
      <SvgText x="28" y="41.5" fill={ink} fontSize="9" fontWeight="800" textAnchor="middle">S</SvgText>

      <Circle cx="82" cy="18" r="8" fill={nodeFill} stroke={done} strokeWidth={1.7} />
      <Circle cx="136" cy="24" r="8" fill={nodeFill} stroke={done} strokeWidth={1.7} />
      <Circle cx="82" cy="58" r="7.5" fill={nodeFill} stroke={idle} strokeWidth={1.4} />

      <Circle cx="172" cy="42" r="9" fill="rgba(126, 211, 33, 0.22)" stroke={done} strokeWidth={1.8} />
      <SvgText x="172" y="45.5" fill={ink} fontSize="9" fontWeight="800" textAnchor="middle">T</SvgText>
    </Svg>
  );
}

export const AlgorithmCard: React.FC<AlgorithmCardProps> = ({
  algoritmo,
  onPress,
  progreso,
}) => {
  const { theme, mode } = useThemeContext();
  const { colors } = theme;
  const isDark = mode === 'dark';
  const [focused, setFocused] = useState(false);

  const handlePress = useCallback(() => {
    onPress(algoritmo);
  }, [algoritmo, onPress]);

  const categoryLabel =
    CATEGORY_LABELS[algoritmo.categoria] ?? algoritmo.categoria;
  const dificultad = normalizeDificultad(algoritmo.dificultad);
  const categoryKey = categoryLabel.trim().toLowerCase();
  const tags = [
    categoryLabel,
    ...(algoritmo.tags ?? []).filter(
      (tag) => tag.trim().toLowerCase() !== categoryKey,
    ),
  ].slice(0, 3);

  const progressPct =
    progreso && progreso.ejerciciosTotales > 0
      ? Math.round(
          (progreso.ejerciciosCorrectos / progreso.ejerciciosTotales) * 100,
        )
      : 0;

  return (
    <Pressable
      onPress={handlePress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      accessibilityRole="button"
      accessibilityLabel={`Ver algoritmo ${algoritmo.nombre}, categoría ${categoryLabel}`}
      accessibilityHint="Abre el detalle del algoritmo"
      testID={`algorithm-card-${algoritmo.id}`}
      style={({ pressed, hovered }: any) => [
        styles.touchable,
        styles.card,
        {
          backgroundColor: hovered
            ? colors.surfaceElevated
            : colors.cardBackground,
          borderColor:
            pressed || focused
              ? colors.brandAccent
              : hovered
                ? colors.brandAccent
                : colors.cardBorder,
        },
        pressed && styles.cardPressed,
        Platform.OS === 'web' &&
          ({
            boxShadow: isDark
              ? hovered || focused
                ? '0 0 0 1px rgba(0, 212, 255, 0.25), 0 14px 28px rgba(0, 0, 0, 0.28)'
                : '0 12px 26px rgba(0, 0, 0, 0.18), inset 0 0 24px rgba(255, 255, 255, 0.012)'
              : hovered || focused
                ? '0 8px 24px rgba(15, 23, 42, 0.10)'
                : '0 2px 10px rgba(15, 23, 42, 0.05)',
            ...(focused
              ? {
                  outlineWidth: 2,
                  outlineStyle: 'solid',
                  outlineColor: colors.brandAccent,
                  outlineOffset: 2,
                }
              : {}),
          } as any),
      ]}
    >
      <View style={styles.topLayer}>
        <DifficultyBadge dificultad={dificultad} />
      </View>

      <View
        style={[
          styles.artWrap,
          {
            borderColor: colors.borderSubtle,
            backgroundColor: isDark
              ? 'rgba(4, 9, 17, 0.55)'
              : 'rgba(241, 245, 249, 0.85)',
          },
        ]}
      >
        <AlgorithmArt name={algoritmo.nombre} isDark={isDark} />
      </View>

      <View style={styles.copyBlock}>
        <Text style={[styles.name, { color: colors.textPrimary }]} numberOfLines={1}>
          {algoritmo.nombre}
        </Text>
        <Text
          style={[styles.description, { color: colors.textSecondary }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {algoritmo.descripcion}
        </Text>
        <View style={styles.tagsSpacer} />
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tagBadge,
                {
                  borderColor: colors.chipBorder,
                  backgroundColor: colors.chipBackground,
                },
              ]}
            >
              <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                {tag}
              </Text>
            </View>
          ))}
        </View>

        {progreso && progreso.ejerciciosTotales > 0 && (
          <View style={styles.progressContainer}>
            <View
              style={[
                styles.progressBarTrack,
                { backgroundColor: colors.progressTrack },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: colors.progressFill,
                    width: `${progressPct}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressText, { color: colors.textSecondary }]}>
              {progressPct}%
            </Text>
          </View>
        )}
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderSubtle }]}>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Tiempo
          </Text>
          <Text style={[styles.metricValue, { color: colors.complexityText }]}>
            {algoritmo.complejidadTiempo}
          </Text>
        </View>
        <View style={styles.metric}>
          <Text style={[styles.metricLabel, { color: colors.textMuted }]}>
            Espacio
          </Text>
          <Text style={[styles.metricValue, { color: colors.complexityText }]}>
            {algoritmo.complejidadEspacio}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  card: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 196,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[4],
    paddingBottom: Spacing[4],
    overflow: 'hidden',
    ...Platform.select({
      web: {
        cursor: 'pointer',
        transitionProperty: 'border-color, background-color, transform, box-shadow',
        transitionDuration: '180ms',
      } as any,
      android: { elevation: 3 },
    }),
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
  },
  topLayer: {
    minHeight: 26,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: Spacing[2],
    zIndex: 3,
  },
  artWrap: {
    height: 88,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
  },
  artSvg: {
    width: '100%',
    maxWidth: 210,
    height: 74,
  },
  copyBlock: {
    flex: 1,
    flexDirection: 'column',
    minHeight: 0,
  },
  name: {
    fontFamily: FontFamilies.bold,
    fontWeight: FontWeights.bold,
    fontSize: 20,
    lineHeight: 24,
    marginBottom: Spacing[1],
  },
  description: {
    fontFamily: FontFamilies.regular,
    fontWeight: FontWeights.regular,
    fontSize: FontSizes.sm,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: Spacing[3],
  },
  tagsSpacer: {
    flex: 1,
    minHeight: Spacing[2],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing[1.5],
    alignContent: 'flex-end',
    alignItems: 'flex-end',
    marginBottom: Spacing[4],
  },
  tagBadge: {
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    paddingHorizontal: Spacing[2.5],
    paddingVertical: Spacing[1],
    flexShrink: 0,
  },
  tagText: {
    fontFamily: FontFamilies.medium,
    fontWeight: FontWeights.medium,
    fontSize: 11,
    lineHeight: 14,
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing[3],
    marginTop: Spacing[1],
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: Spacing[3],
    rowGap: Spacing[1],
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing[2],
    flexShrink: 1,
    maxWidth: '100%',
  },
  metricLabel: {
    fontFamily: FontFamilies.regular,
    fontSize: FontSizes.sm,
  },
  metricValue: {
    fontFamily: FontFamilies.mono,
    fontWeight: FontWeights.bold,
    fontSize: FontSizes.md,
    flexShrink: 1,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[1],
    marginBottom: Spacing[2],
    gap: Spacing[2],
  },
  progressBarTrack: {
    flex: 1,
    height: 5,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  progressText: {
    fontFamily: FontFamilies.semiBold,
    fontSize: 12,
    lineHeight: 16,
    minWidth: 32,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});

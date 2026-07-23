import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  GestureResponderEvent,
  PanResponder,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { generateBoard, LARGE_WORD_BANK } from '../wordSearchEngine';

interface Pos {
  row: number;
  col: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BOARD_SIZE = 10;
const IS_TABLET = SCREEN_WIDTH >= 768;

// Cálculo responsive dinámico para las celdas del tablero
const AVAILABLE_WIDTH = Math.min(SCREEN_WIDTH - 40, 500);
const CALCULATED_CELL_SIZE = Math.floor((AVAILABLE_WIDTH - 16) / BOARD_SIZE);
const CELL_SIZE = Math.min(CALCULATED_CELL_SIZE, IS_TABLET ? 48 : 36);

// URLs públicas de efectos de sonido libres de derechos
const SOUND_SUCCESS_URL = 'https://cdn.freesound.org/previews/536/536108_11861866-lq.mp3';
const SOUND_ERROR_URL = 'https://cdn.freesound.org/previews/142/142608_1840739-lq.mp3';
const SOUND_WIN_URL = 'https://cdn.freesound.org/previews/274/274178_5121236-lq.mp3';

export default function GameScreen() {
  const router = useRouter();

  const [board, setBoard] = useState<string[][]>([]);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundCells, setFoundCells] = useState<Pos[]>([]);
  const [selectedCells, setSelectedCells] = useState<Pos[]>([]);

  // Cargamos los reproductores desde URLs remotas
  const playerSuccess = useAudioPlayer(SOUND_SUCCESS_URL);
  const playerError = useAudioPlayer(SOUND_ERROR_URL);
  const playerWin = useAudioPlayer(SOUND_WIN_URL);

  const gridRef = useRef<View>(null);

  const selectedCellsRef = useRef<Pos[]>([]);
  const startPosRef = useRef<Pos | null>(null);
  const targetWordsRef = useRef<string[]>([]);
  const foundWordsRef = useRef<string[]>([]);
  const boardRef = useRef<string[][]>([]);

  useEffect(() => {
    targetWordsRef.current = targetWords;
  }, [targetWords]);

  useEffect(() => {
    foundWordsRef.current = foundWords;
  }, [foundWords]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  const gridLayoutRef = useRef<{ x: number; y: number; width: number; height: number }>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Funciones de audio y vibración
  const playSuccessEffect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      playerSuccess.seekTo(0);
      playerSuccess.play();
    } catch (e) {}
  };

  const playErrorEffect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    try {
      playerError.seekTo(0);
      playerError.play();
    } catch (e) {}
  };

  const playWinEffect = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    try {
      playerWin.seekTo(0);
      playerWin.play();
    } catch (e) {}
  };

  const updateSelectedCells = (cells: Pos[]) => {
    selectedCellsRef.current = cells;
    setSelectedCells(cells);
  };

  const startNewGame = () => {
    const { board: newBoard, placedWords } = generateBoard(6, BOARD_SIZE, LARGE_WORD_BANK);
    setBoard(newBoard);
    setTargetWords(placedWords);
    setFoundWords([]);
    setFoundCells([]);
    updateSelectedCells([]);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const getCellFromCoords = (pageX: number, pageY: number): Pos | null => {
    const { x, y } = gridLayoutRef.current;
    const relX = pageX - x;
    const relY = pageY - y;

    if (relX < 0 || relY < 0) return null;

    const step = CELL_SIZE + 2;

    const col = Math.floor(relX / step);
    const row = Math.floor(relY / step);

    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE) {
      return { row, col };
    }
    return null;
  };

  const getLineCells = (start: Pos, end: Pos): Pos[] => {
    const rowDiff = end.row - start.row;
    const colDiff = end.col - start.col;

    const isHorizontal = rowDiff === 0;
    const isVertical = colDiff === 0;
    const isDiagonal = Math.abs(rowDiff) === Math.abs(colDiff);

    if (!isHorizontal && !isVertical && !isDiagonal) return [start];

    const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
    const rowStep = rowDiff === 0 ? 0 : rowDiff / steps;
    const colStep = colDiff === 0 ? 0 : colDiff / steps;

    const cells: Pos[] = [];
    for (let i = 0; i <= steps; i++) {
      cells.push({
        row: start.row + i * rowStep,
        col: start.col + i * colStep,
      });
    }
    return cells;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const cell = getCellFromCoords(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
        if (cell) {
          startPosRef.current = cell;
          updateSelectedCells([cell]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
      },

      onPanResponderMove: (evt: GestureResponderEvent) => {
        if (!startPosRef.current) return;
        const currentCell = getCellFromCoords(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
        if (currentCell) {
          const line = getLineCells(startPosRef.current, currentCell);

          if (line.length !== selectedCellsRef.current.length) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }

          updateSelectedCells(line);
        }
      },

      onPanResponderRelease: () => {
        const currentSelected = selectedCellsRef.current;
        const currentBoard = boardRef.current;
        const currentTargets = targetWordsRef.current;
        const currentFound = foundWordsRef.current;

        if (currentSelected.length > 1 && currentBoard.length > 0) {
          const wordSelected = currentSelected.map(p => currentBoard[p.row][p.col]).join('');
          const wordReversed = wordSelected.split('').reverse().join('');

          const match = currentTargets.find(
            w => (w === wordSelected || w === wordReversed) && !currentFound.includes(w)
          );

          if (match) {
            const newFoundWords = [...currentFound, match];
            setFoundWords(newFoundWords);
            setFoundCells(prev => [...prev, ...currentSelected]);

            if (newFoundWords.length === currentTargets.length) {
              playWinEffect();
              Alert.alert('🎉 ¡Completado!', 'Has encontrado todas las palabras del tablero.');
            } else {
              playSuccessEffect();
            }
          } else {
            playErrorEffect();
          }
        }

        startPosRef.current = null;
        updateSelectedCells([]);
      },
    })
  ).current;

  const isSelected = (r: number, c: number) =>
    selectedCells.some(p => p.row === r && p.col === c);

  const isFound = (r: number, c: number) =>
    foundCells.some(p => p.row === r && p.col === c);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Cabecera limpia */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Sopa de Letras</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Tablero */}
        <View
          ref={gridRef}
          style={styles.grid}
          {...panResponder.panHandlers}
          onLayout={() => {
            gridRef.current?.measureInWindow((x, y, width, height) => {
              gridLayoutRef.current = { x, y, width, height };
            });
          }}
        >
          {board.map((row, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {row.map((letter, colIndex) => {
                const active = isSelected(rowIndex, colIndex);
                const found = isFound(rowIndex, colIndex);

                return (
                  <View
                    key={colIndex}
                    style={[
                      styles.cell,
                      active && styles.cellSelected,
                      found && styles.cellFound,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        (active || found) && styles.cellTextHighlight,
                      ]}
                    >
                      {letter}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>

        {/* Palabras a Buscar */}
        <View style={styles.wordsContainer}>
          <Text style={styles.subtitle}>Palabras a buscar:</Text>
          <View style={styles.wordBadgeContainer}>
            {targetWords.map((word, index) => {
              const isWordFound = foundWords.includes(word);
              return (
                <View
                  key={index}
                  style={[styles.wordBadge, isWordFound && styles.wordBadgeFound]}
                >
                  <Text style={[styles.wordText, isWordFound && styles.wordTextFound]}>
                    {word}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Botón de reinicio */}
        <TouchableOpacity style={styles.resetButton} onPress={startNewGame}>
          <Text style={styles.resetButtonText}>Nueva Partida</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  header: {
    width: '100%',
    maxWidth: 500,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: IS_TABLET ? 24 : 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#495057',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    fontSize: IS_TABLET ? 28 : 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  grid: {
    backgroundColor: '#ffffff',
    padding: 6,
    borderRadius: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    margin: 1,
    borderRadius: 6,
    backgroundColor: '#f1f3f5',
  },
  cellSelected: {
    backgroundColor: '#4c6ef5',
  },
  cellFound: {
    backgroundColor: '#40c057',
  },
  cellText: {
    fontSize: Math.floor(CELL_SIZE * 0.45),
    fontWeight: 'bold',
    color: '#495057',
  },
  cellTextHighlight: {
    color: '#ffffff',
  },
  wordsContainer: {
    marginTop: IS_TABLET ? 24 : 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 500,
  },
  subtitle: {
    fontSize: IS_TABLET ? 18 : 15,
    fontWeight: '600',
    color: '#868e96',
    marginBottom: 10,
  },
  wordBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: IS_TABLET ? 10 : 6,
  },
  wordBadge: {
    paddingHorizontal: IS_TABLET ? 14 : 10,
    paddingVertical: IS_TABLET ? 8 : 5,
    borderRadius: 14,
    backgroundColor: '#e9ecef',
  },
  wordBadgeFound: {
    backgroundColor: '#d3f9d8',
  },
  wordText: {
    fontSize: IS_TABLET ? 15 : 13,
    fontWeight: '600',
    color: '#495057',
  },
  wordTextFound: {
    color: '#2b8a3e',
    textDecorationLine: 'line-through',
  },
  resetButton: {
    marginTop: IS_TABLET ? 28 : 20,
    backgroundColor: '#228be6',
    paddingHorizontal: IS_TABLET ? 28 : 22,
    paddingVertical: IS_TABLET ? 14 : 10,
    borderRadius: 24,
  },
  resetButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: IS_TABLET ? 17 : 15,
  },
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, ViewStyle, Dimensions, View } from 'react-native';
import Animated, {
    useAnimatedReaction,
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    SharedValue,
    withTiming,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');
const COLUMNS = 2;
const MARGIN = 16;
const ITEM_WIDTH = (width - MARGIN * 3) / COLUMNS;

interface SortableGridProps<T extends { id: string }> {
    data: T[];
    onDragEnd: (data: T[]) => void;
    renderItem: (item: T, index: number) => React.ReactNode;
    renderFooter?: () => React.ReactNode;
    editing: boolean;
}

export default function SortableGrid<T extends { id: string }>({ data, onDragEnd, renderItem, renderFooter, editing }: SortableGridProps<T>) {
    const positions = useSharedValue<Record<string, number>>(
        Object.assign({}, ...data.map((item, index) => ({ [item.id]: index })))
    );

    // Update positions when data changes externally (e.g. initial load or add/delete)
    useEffect(() => {
        positions.value = Object.assign({}, ...data.map((item, index) => ({ [item.id]: index })));
    }, [data]);

    const handleReorder = (fromIndex: number, toIndex: number) => {
        const newData = [...data];
        const [movedItem] = newData.splice(fromIndex, 1);
        newData.splice(toIndex, 0, movedItem);
        onDragEnd(newData);
    };

    const totalItems = data.length + (renderFooter ? 1 : 0);
    const containerHeight = Math.ceil(totalItems / COLUMNS) * (ITEM_WIDTH + MARGIN);

    return (
        <View style={[styles.container, { height: containerHeight }]}>
            {data.map((item, index) => (
                <SortableItem
                    key={item.id}
                    id={item.id}
                    positions={positions}
                    editing={editing}
                    onReorder={handleReorder}
                    totalItems={data.length}
                    initialOrder={index}
                >
                    {renderItem(item, index)}
                </SortableItem>
            ))}
            {renderFooter && (
                <View
                    style={{
                        position: 'absolute',
                        left: (data.length % COLUMNS) * (ITEM_WIDTH + MARGIN),
                        top: Math.floor(data.length / COLUMNS) * (ITEM_WIDTH + MARGIN),
                        width: ITEM_WIDTH,
                        height: ITEM_WIDTH,
                    }}
                >
                    {renderFooter()}
                </View>
            )}
        </View>
    );
}

interface SortableItemProps {
    children: React.ReactNode;
    id: string;
    positions: SharedValue<Record<string, number>>;
    editing: boolean;
    onReorder: (from: number, to: number) => void;
    totalItems: number;
}

const SortableItem = ({ children, id, positions, editing, onReorder, totalItems, initialOrder }: SortableItemProps & { initialOrder: number }) => {
    const position = useSharedValue(initialOrder);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const isDragging = useSharedValue(false);

    useAnimatedReaction(
        () => positions.value[id],
        (newOrder) => {
            if (!isDragging.value) {
                position.value = newOrder;
            }
        }
    );

    const getPosition = (order: number) => {
        'worklet';
        const col = order % COLUMNS;
        const row = Math.floor(order / COLUMNS);
        return {
            x: col * (ITEM_WIDTH + MARGIN),
            y: row * (ITEM_WIDTH + MARGIN),
        };
    };

    const getOrder = (x: number, y: number) => {
        'worklet';
        const col = Math.round(x / (ITEM_WIDTH + MARGIN));
        const row = Math.round(y / (ITEM_WIDTH + MARGIN));
        return row * COLUMNS + col;
    };

    const pan = Gesture.Pan()
        .enabled(editing)
        .onStart(() => {
            isDragging.value = true;
            runOnJS(Haptics.selectionAsync)();
        })
        .onUpdate((event) => {
            translateX.value = event.translationX;
            translateY.value = event.translationY;

            const currentPos = getPosition(position.value);
            const absoluteX = currentPos.x + translateX.value;
            const absoluteY = currentPos.y + translateY.value;

            const newOrder = getOrder(absoluteX, absoluteY);

            // Simple reordering logic: if we hover over another slot, swap visually
            // This requires updating the shared value for ALL items, which is complex here.
            // For now, we will just stick to drag and drop at the end.
        })
        .onEnd((event) => {
            const currentPos = getPosition(position.value);
            const absoluteX = currentPos.x + event.translationX;
            const absoluteY = currentPos.y + event.translationY;
            const newOrder = Math.max(0, Math.min(getOrder(absoluteX, absoluteY), totalItems - 1));

            if (newOrder !== position.value) {
                runOnJS(onReorder)(position.value, newOrder);
            }

            translateX.value = withTiming(0);
            translateY.value = withTiming(0);
            isDragging.value = false;
        });

    const animatedStyle = useAnimatedStyle(() => {
        const pos = getPosition(position.value);
        return {
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            width: ITEM_WIDTH,
            height: ITEM_WIDTH,
            zIndex: isDragging.value ? 100 : 1,
            transform: [
                { translateX: translateX.value },
                { translateY: translateY.value },
                { scale: withSpring(isDragging.value ? 1.1 : 1) },
            ],
        };
    });

    return (
        <GestureDetector gesture={pan}>
            <Animated.View style={animatedStyle}>
                {children}
            </Animated.View>
        </GestureDetector>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        position: 'relative', // Needed for absolute positioning of children
    },
});

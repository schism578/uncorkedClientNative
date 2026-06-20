import React, { useState } from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { colors, radius, spacing, input as inputStyle } from '../theme';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownProps {
  placeholder: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
}

export function Dropdown({ placeholder, value, options, onChange }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);

  return (
    <>
      <Pressable style={styles.field} onPress={() => setOpen(true)}>
        <Text style={selected ? styles.valueText : styles.placeholderText}>
          {selected ? selected.label : placeholder}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <FlatList
              data={options}
              keyExtractor={item => item.value}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    style={[styles.option, isSelected && styles.optionSelected]}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    ...inputStyle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  valueText: {
    fontSize: 16,
    color: colors.textDark,
    flexShrink: 1,
  },
  placeholderText: {
    fontSize: 16,
    color: colors.placeholder,
    flexShrink: 1,
  },
  chevron: {
    fontSize: 14,
    color: colors.muted,
    marginLeft: spacing.sm,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(40,28,18,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  sheet: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '70%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.xs,
  },
  option: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  optionSelected: {
    backgroundColor: '#f1e4cf',
  },
  optionText: {
    fontSize: 16,
    color: colors.textDark,
  },
  optionTextSelected: {
    fontWeight: '700',
    color: colors.primary,
  },
});

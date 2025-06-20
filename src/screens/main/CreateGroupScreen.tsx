import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';
import { Text, TextInput, Button, ActivityIndicator, Chip, IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../store';
import { createGroup } from '../../store/slices/groupsSlice';

const DEFAULT_RULES = [
  'Respecter les horaires',
  'Pas d’insultes',
  'Fair-play',
  'Tenue correcte',
  'Pas de violence',
];

const CreateGroupScreen = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState<string[]>([]);
  const [customRule, setCustomRule] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  const handleAddRule = (rule: string) => {
    if (!rules.includes(rule)) {
      setRules([...rules, rule]);
    }
  };

  const handleAddCustomRule = () => {
    const trimmed = customRule.trim();
    if (trimmed && !rules.includes(trimmed)) {
      setRules([...rules, trimmed]);
      setCustomRule('');
    }
  };

  const handleRemoveRule = (rule: string) => {
    setRules(rules.filter(r => r !== rule));
  };

  const handleCreate = async () => {
    setLoading(true);
    setError('');
    try {
      await dispatch(createGroup({ name, description, rules })).unwrap();
      navigation.goBack();
    } catch (err: any) {
      setError('Erreur lors de la création du groupe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
      <Text style={styles.title}>Créer un groupe</Text>
      <TextInput
        label="Nom du groupe"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        multiline
      />
      <Text style={styles.label}>Règles du groupe</Text>
      <View style={styles.rulesContainer}>
        {DEFAULT_RULES.map((rule) => (
          <Chip
            key={rule}
            selected={rules.includes(rule)}
            onPress={() => handleAddRule(rule)}
            style={styles.chip}
          >
            {rule}
          </Chip>
        ))}
      </View>
      <View style={styles.addRuleRow}>
        <TextInput
          label="Ajouter une règle personnalisée"
          value={customRule}
          onChangeText={setCustomRule}
          style={[styles.input, { flex: 1, marginBottom: 0 }]}
        />
        <IconButton
          icon="plus"
          size={28}
          onPress={handleAddCustomRule}
          disabled={!customRule.trim() || rules.includes(customRule.trim())}
        />
      </View>
      <View style={styles.selectedRulesContainer}>
        {rules.map((rule) => (
          <Chip
            key={rule}
            onClose={() => handleRemoveRule(rule)}
            style={styles.selectedChip}
          >
            {rule}
          </Chip>
        ))}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button
        mode="contained"
        onPress={handleCreate}
        loading={loading}
        disabled={loading || !name}
        style={styles.button}
      >
        Créer
      </Button>
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    
  </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 8,
  },
  rulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  addRuleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedRulesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  selectedChip: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  error: {
    color: '#e53935',
    marginBottom: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 100,
  },
});

export default CreateGroupScreen; 
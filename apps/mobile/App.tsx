import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Integration = {
  slug: string;
  name: string;
  category: 'web-stores' | 'marketplaces' | 'logistics' | 'tech';
  regions: string[];
  description: string;
  capabilities: string[];
  connected: boolean;
  status: string;
  syncCount: number;
  lastSyncAt: string | null;
};

const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

const sampleIntegrations: Integration[] = [
  {
    slug: 'amazon',
    name: 'Amazon',
    category: 'marketplaces',
    regions: ['India', 'Global'],
    description: 'Manage listings, pricing and order flow for Amazon channels.',
    capabilities: ['Listing publish', 'Price sync', 'Returns'],
    connected: true,
    status: 'Connected',
    syncCount: 428,
    lastSyncAt: new Date().toISOString()
  },
  {
    slug: 'flipkart',
    name: 'Flipkart',
    category: 'marketplaces',
    regions: ['India'],
    description: 'Publish garment listings, monitor stock and import customer orders.',
    capabilities: ['Catalog listing', 'Inventory sync', 'Order import'],
    connected: true,
    status: 'Connected',
    syncCount: 316,
    lastSyncAt: new Date().toISOString()
  },
  {
    slug: 'shiprocket',
    name: 'Shiprocket',
    category: 'logistics',
    regions: ['India'],
    description: 'Automate courier allocation and shipment tracking for marketplace orders.',
    capabilities: ['Courier allocation', 'Label generation', 'Tracking'],
    connected: false,
    status: 'Available',
    syncCount: 332,
    lastSyncAt: null
  }
];

const categories = [
  { id: 'all', label: 'All' },
  { id: 'marketplaces', label: 'Marketplaces' },
  { id: 'logistics', label: 'Logistics' },
  { id: 'web-stores', label: 'Web Stores' },
  { id: 'tech', label: 'Tech' }
] as const;

export default function App() {
  const [integrations, setIntegrations] = useState<Integration[]>(sampleIntegrations);
  const [category, setCategory] = useState<(typeof categories)[number]['id']>('all');
  const [query, setQuery] = useState('');
  const [notice, setNotice] = useState('Ready to sync marketplace channels');

  useEffect(() => {
    fetch(`${apiUrl}/api/integrations`)
      .then((response) => (response.ok ? response.json() : sampleIntegrations))
      .then(setIntegrations)
      .catch(() => setIntegrations(sampleIntegrations));
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return integrations.filter((integration) => {
      const matchesCategory = category === 'all' || integration.category === category;
      const matchesQuery =
        !normalizedQuery ||
        integration.name.toLowerCase().includes(normalizedQuery) ||
        integration.capabilities.some((capability) => capability.toLowerCase().includes(normalizedQuery));

      return matchesCategory && matchesQuery;
    });
  }, [category, integrations, query]);

  async function updateIntegration(slug: string, action: 'connect' | 'disconnect' | 'sync') {
    try {
      const response = await fetch(
        action === 'sync' ? `${apiUrl}/api/integrations/${slug}/sync` : `${apiUrl}/api/integrations/${slug}/connect`,
        {
          method: action === 'sync' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: action === 'sync' ? undefined : JSON.stringify({ connected: action === 'connect' })
        }
      );
      const updated = (await response.json()) as Integration;
      setIntegrations((items) => items.map((item) => (item.slug === slug ? updated : item)));
      setNotice(`${updated.name} updated`);
    } catch {
      setIntegrations((items) =>
        items.map((item) => {
          if (item.slug !== slug) return item;
          const connected = action !== 'disconnect';
          return {
            ...item,
            connected,
            status: connected ? 'Connected' : 'Available',
            lastSyncAt: connected ? new Date().toISOString() : null,
            syncCount: action === 'sync' ? item.syncCount + 1 : item.syncCount
          };
        })
      );
      setNotice('Updated locally');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>The Thread Sutra</Text>
            <Text style={styles.subtle}>Integrations console</Text>
          </View>
          <View style={styles.iconButton}>
            <Feather name="git-merge" size={20} color="#ffffff" />
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>Market in a box</Text>
          <Text style={styles.title}>Connect every garment sales channel.</Text>
          <Text style={styles.copy}>{notice}</Text>
          <TextInput value={query} onChangeText={setQuery} placeholder="Search integrations" style={styles.input} />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {categories.map((item) => (
            <Pressable key={item.id} onPress={() => setCategory(item.id)} style={[styles.tab, category === item.id && styles.activeTab]}>
              <Text style={[styles.tabText, category === item.id && styles.activeTabText]}>{item.label}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.stats}>
          <Text style={styles.stat}>{filtered.length} visible</Text>
          <Text style={styles.stat}>{integrations.filter((item) => item.connected).length} connected</Text>
        </View>

        {filtered.map((integration) => (
          <View key={integration.slug} style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.category}>{integration.category.replace('-', ' ')}</Text>
                <Text style={styles.name}>{integration.name}</Text>
              </View>
              <Text style={[styles.status, integration.connected && styles.connected]}>{integration.status}</Text>
            </View>
            <Text style={styles.description}>{integration.description}</Text>
            <View style={styles.tags}>
              {integration.capabilities.map((capability) => (
                <Text key={capability} style={styles.tag}>
                  {capability}
                </Text>
              ))}
            </View>
            <Text style={styles.meta}>Regions: {integration.regions.join(', ')}</Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => updateIntegration(integration.slug, integration.connected ? 'disconnect' : 'connect')}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>{integration.connected ? 'Disconnect' : 'Connect'}</Text>
              </Pressable>
              <Pressable onPress={() => updateIntegration(integration.slug, 'sync')} style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Sync</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fbfaf7' },
  container: { padding: 20, paddingBottom: 40 },
  header: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  brand: { color: '#1f2421', fontSize: 22, fontWeight: '900' },
  subtle: { color: 'rgba(31,36,33,0.56)', marginTop: 3 },
  iconButton: { alignItems: 'center', backgroundColor: '#1f2421', borderRadius: 8, height: 44, justifyContent: 'center', width: 44 },
  hero: { backgroundColor: '#ffffff', borderColor: 'rgba(31,36,33,0.1)', borderRadius: 8, borderWidth: 1, padding: 18 },
  kicker: { color: '#b83b5e', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  title: { color: '#1f2421', fontSize: 32, fontWeight: '900', lineHeight: 37, marginTop: 10 },
  copy: { color: 'rgba(31,36,33,0.62)', lineHeight: 22, marginTop: 10 },
  input: { backgroundColor: '#fbfaf7', borderColor: 'rgba(31,36,33,0.12)', borderRadius: 8, borderWidth: 1, height: 46, marginTop: 16, paddingHorizontal: 12 },
  tabs: { gap: 8, paddingVertical: 16 },
  tab: { borderColor: 'rgba(31,36,33,0.12)', borderRadius: 8, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10 },
  activeTab: { backgroundColor: '#1f2421', borderColor: '#1f2421' },
  tabText: { color: '#1f2421', fontWeight: '800' },
  activeTabText: { color: '#ffffff' },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  stat: { backgroundColor: '#f3eee7', borderRadius: 8, color: '#1f2421', fontWeight: '900', padding: 10 },
  card: { backgroundColor: '#ffffff', borderColor: 'rgba(31,36,33,0.1)', borderRadius: 8, borderWidth: 1, marginBottom: 14, padding: 16 },
  cardHeader: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  category: { color: '#2f6f5e', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  name: { color: '#1f2421', fontSize: 24, fontWeight: '900', marginTop: 5 },
  status: { backgroundColor: 'rgba(31,36,33,0.06)', borderRadius: 8, color: 'rgba(31,36,33,0.6)', fontSize: 12, fontWeight: '900', paddingHorizontal: 9, paddingVertical: 6 },
  connected: { backgroundColor: 'rgba(47,111,94,0.12)', color: '#2f6f5e' },
  description: { color: 'rgba(31,36,33,0.64)', lineHeight: 22, marginTop: 12 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { backgroundColor: '#f3eee7', borderRadius: 8, color: 'rgba(31,36,33,0.7)', fontSize: 12, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 6 },
  meta: { color: 'rgba(31,36,33,0.55)', marginTop: 12 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 14 },
  secondaryButton: { alignItems: 'center', borderColor: 'rgba(31,36,33,0.14)', borderRadius: 8, borderWidth: 1, flex: 1, height: 42, justifyContent: 'center' },
  secondaryButtonText: { color: '#1f2421', fontWeight: '900' },
  primaryButton: { alignItems: 'center', backgroundColor: '#b83b5e', borderRadius: 8, flex: 1, height: 42, justifyContent: 'center' },
  primaryButtonText: { color: '#ffffff', fontWeight: '900' }
});

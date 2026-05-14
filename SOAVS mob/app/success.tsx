import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GlassPanel } from '@/components/GlassPanel';
import { Colors } from '@/constants/theme';
import { CircleCheck, ArrowLeft } from 'lucide-react-native';

export default function SuccessScreen() {
  const router = useRouter();
  const [receipt, setReceipt] = useState<any[]>([]);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const receiptStr = await AsyncStorage.getItem('vote_receipt');
        if (receiptStr) {
          setReceipt(JSON.parse(receiptStr));
        }
      } catch (error) {
        console.error('Could not load receipt');
      }
    };
    fetchReceipt();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.pulse1} />
          <View style={styles.pulse2} />
          <CircleCheck size={100} color={Colors.success} fill="rgba(16, 185, 129, 0.1)" />
        </View>

        <Text style={styles.title}>Vote Cast Successfully!</Text>
        <Text style={styles.message}>
          Your ballot has been securely encrypted and recorded in the system. Thank you for participating in the democratic process.
        </Text>

        {receipt.length > 0 ? (
          <GlassPanel style={styles.infoCard}>
            <Text style={styles.infoTitle}>Vote Receipt</Text>
            <Text style={styles.infoSubtitle}>Take a screenshot for your records</Text>
            
            <View style={styles.receiptList}>
              {receipt.map((item, index) => (
                <View key={index} style={styles.receiptItem}>
                  <Text style={styles.receiptPosition}>{item.position}</Text>
                  {item.candidates.map((candName: string, cIdx: number) => (
                    <Text key={cIdx} style={styles.receiptCandidate}>• {candName}</Text>
                  ))}
                </View>
              ))}
            </View>
          </GlassPanel>
        ) : (
          <GlassPanel style={styles.infoCard}>
            <Text style={styles.infoTitle}>What's Next?</Text>
            <Text style={styles.infoText}>
              You have now been marked as "Voted" for this election. You can view the results once the administrator concludes the voting period.
            </Text>
          </GlassPanel>
        )}

        <TouchableOpacity 
          style={styles.button} 
          onPress={() => router.replace('/dashboard')}
        >
          <ArrowLeft size={20} color="#fff" style={{marginRight: 10}} />
          <Text style={styles.buttonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
    paddingBottom: 40,
  },
  iconContainer: {
    width: 150,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  pulse1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.success,
    borderRadius: 75,
    opacity: 0.1,
    transform: [{ scale: 1.2 }],
  },
  pulse2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.success,
    borderRadius: 75,
    opacity: 0.05,
    transform: [{ scale: 1.4 }],
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 16,
  },
  message: {
    color: Colors.textMuted,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  infoCard: {
    width: '100%',
    marginBottom: 40,
  },
  infoTitle: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    lineHeight: 20,
  },
  infoSubtitle: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 15,
  },
  receiptList: {
    marginTop: 5,
  },
  receiptItem: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    paddingBottom: 8,
  },
  receiptPosition: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  receiptCandidate: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 8,
    marginBottom: 2,
  },
  button: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    paddingHorizontal: 32,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  }
});

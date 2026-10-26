import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

const metrics = [
  { label: 'My active tasks', value: '—', hint: 'Assigned to you' },
  { label: 'Pending approvals', value: '—', hint: 'Awaiting action' },
  { label: 'Site reports', value: '—', hint: 'This week' },
  { label: 'Open issues', value: '—', hint: 'Needs attention' }
];
const shortcuts = [
  ['Daily site report', 'Add progress, labour and photos'],
  ['My tasks', 'See assignments and due dates'],
  ['Department messages', 'Coordinate with your team'],
  ['Report an issue', 'Raise a safety or site concern']
];
export default function HomeScreen() {
  const [active, setActive] = useState('Overview');
  return <SafeAreaView style={s.safe}><ScrollView contentContainerStyle={s.page}>
    <View style={s.header}><View><Text style={s.brand}>SITEFLOW</Text><Text style={s.kicker}>CONSTRUCTION OPERATIONS</Text></View><View style={s.avatar}><Text style={s.avatarText}>SF</Text></View></View>
    <View style={s.welcome}><Text style={s.welcomeTitle}>Your site, in sync.</Text><Text style={s.welcomeSub}>Sign in to see your assigned project activity.</Text><Text style={s.notice}>Mobile foundation preview · Connect company Firebase to enable accounts and live data.</Text></View>
    <Text style={s.section}>AT A GLANCE</Text><View style={s.metrics}>{metrics.map(x => <View style={s.metric} key={x.label}><Text style={s.metricValue}>{x.value}</Text><Text style={s.metricLabel}>{x.label}</Text><Text style={s.metricHint}>{x.hint}</Text></View>)}</View>
    <Text style={s.section}>QUICK ACTIONS</Text>{shortcuts.map(([title, sub], i) => <Pressable key={title} onPress={() => setActive(title)} style={[s.action, active === title && s.actionActive]}><View style={s.actionIcon}><Text style={s.actionNumber}>{String(i + 1).padStart(2, '0')}</Text></View><View style={{ flex: 1 }}><Text style={s.actionTitle}>{title}</Text><Text style={s.actionSub}>{sub}</Text></View><Text style={s.chevron}>›</Text></Pressable>)}
    <Text style={s.footer}>Secure access is assigned by your company administrator.</Text>
  </ScrollView><View style={s.bottom}>{['Overview', 'Messages', 'Tasks', 'Profile'].map(tab => <Pressable key={tab} onPress={() => setActive(tab)} style={s.tab}><Text style={[s.tabText, active === tab && s.tabSelected]}>{tab}</Text></Pressable>)}</View></SafeAreaView>;
}
const s = StyleSheet.create({
  safe:{flex:1,backgroundColor:'#F5F7FA'},page:{padding:20,paddingBottom:32},header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginBottom:24},brand:{fontSize:20,fontWeight:'900',letterSpacing:2,color:'#17263B'},kicker:{color:'#778397',fontSize:9,letterSpacing:1.4,marginTop:3,fontWeight:'700'},avatar:{width:40,height:40,borderRadius:14,backgroundColor:'#E7EDF5',alignItems:'center',justifyContent:'center'},avatarText:{color:'#17263B',fontWeight:'800'},welcome:{backgroundColor:'#17263B',borderRadius:22,padding:22,marginBottom:25},welcomeTitle:{color:'#FFFFFF',fontSize:26,fontWeight:'800'},welcomeSub:{color:'#C7D2E1',marginTop:8,fontSize:13,lineHeight:19},notice:{color:'#F4C66A',fontSize:11,marginTop:18,lineHeight:16},section:{color:'#778397',fontWeight:'800',letterSpacing:1.2,fontSize:10,marginBottom:12},metrics:{flexDirection:'row',flexWrap:'wrap',gap:10,marginBottom:26},metric:{width:'48%',backgroundColor:'#FFFFFF',borderRadius:16,padding:15,borderWidth:1,borderColor:'#E8EDF3'},metricValue:{color:'#17263B',fontWeight:'800',fontSize:24},metricLabel:{color:'#25354B',fontWeight:'700',fontSize:12,marginTop:5},metricHint:{color:'#8995A5',fontSize:10,marginTop:4},action:{flexDirection:'row',alignItems:'center',backgroundColor:'#FFFFFF',borderRadius:15,padding:14,marginBottom:9,borderWidth:1,borderColor:'#E8EDF3'},actionActive:{borderColor:'#D69A30',backgroundColor:'#FFFCF5'},actionIcon:{width:38,height:38,borderRadius:12,backgroundColor:'#EEF2F7',alignItems:'center',justifyContent:'center',marginRight:12},actionNumber:{color:'#33445C',fontWeight:'800',fontSize:11},actionTitle:{color:'#1D2B40',fontWeight:'700',fontSize:13},actionSub:{color:'#8995A5',fontSize:11,marginTop:4},chevron:{color:'#A1ACBA',fontSize:24,paddingLeft:8},footer:{color:'#8995A5',textAlign:'center',fontSize:10,marginTop:20},bottom:{flexDirection:'row',backgroundColor:'#FFFFFF',borderTopWidth:1,borderTopColor:'#E8EDF3',paddingVertical:14,justifyContent:'space-around'},tab:{paddingHorizontal:8},tabText:{color:'#8995A5',fontWeight:'700',fontSize:11},tabSelected:{color:'#B47A17'}
});

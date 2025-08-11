import { supabase } from "@/integrations/supabase/client";

// Generate a UUID v4 string
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate dates over a specified range
const generateDateRange = (days: number) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }
  return dates;
};

// Random selection helper
const randomChoice = (array: any[]) => array[Math.floor(Math.random() * array.length)];

// Generate random float between min and max
const randomFloat = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate realistic journal content
const generateJournalContent = (mood: string, age: number) => {
  const templates = {
    happy: [
      "Today was such a great day! I played with my friends and we had so much fun.",
      "I'm feeling really happy because I did well on my test today.",
      "Had an awesome time at the park. The weather was perfect!",
      "My family had a movie night and it was the best evening ever.",
      "I learned something new today and it made me feel really proud."
    ],
    excited: [
      "I can't wait for tomorrow! We're going on a field trip.",
      "My birthday is coming up and I'm so excited about the party!",
      "Just found out we're getting a new pet. I'm over the moon!",
      "The school play is next week and I have the lead role!",
      "Summer vacation starts soon and I have so many plans."
    ],
    calm: [
      "Today was peaceful. I spent time reading my favorite book.",
      "Took a quiet walk and enjoyed looking at the clouds.",
      "Had a relaxing day at home with my family.",
      "Practiced meditation today and felt really centered.",
      "Enjoyed a quiet afternoon drawing in my sketchbook."
    ],
    worried: [
      "I have a big test coming up and I'm feeling nervous about it.",
      "Sometimes I worry about making new friends at school.",
      "I'm a bit anxious about the presentation I have to give.",
      "Feeling uncertain about some changes happening at home.",
      "Had a challenging day but I'm trying to stay positive."
    ],
    proud: [
      "I helped my younger sibling with their homework today.",
      "Stood up for a friend who was being teased at school.",
      "Finished a project I've been working on for weeks.",
      "Made my parents proud by being responsible today.",
      "Overcame a fear I've had for a long time."
    ],
    grateful: [
      "I'm thankful for my supportive family and friends.",
      "Grateful for all the opportunities I have to learn and grow.",
      "Appreciating the little things that make me smile.",
      "Thankful for my teachers who help me understand new things.",
      "Feeling blessed to have such wonderful people in my life."
    ]
  };

  const moodTemplates = templates[mood as keyof typeof templates] || templates.happy;
  return randomChoice(moodTemplates);
};

// Generate SEL reflection content
const generateSELReflection = () => {
  const reflections = [
    "Today I practiced taking deep breaths when I felt overwhelmed.",
    "I noticed when my friend was feeling sad and offered to help.",
    "Made a good choice even when it was difficult.",
    "Recognized my emotions and talked about them with someone I trust.",
    "Showed empathy by listening carefully to a classmate's problem.",
    "Took responsibility for a mistake I made and apologized.",
    "Worked well with my team even when we disagreed.",
    "Celebrated a friend's success without feeling jealous.",
    "Found a peaceful way to solve a conflict with my sibling.",
    "Practiced patience when things didn't go as planned."
  ];
  return randomChoice(reflections);
};

export const seedEnhancedDummyData = async () => {
  try {
    console.log("Starting enhanced dummy data seeding...");

    // First, check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "User must be authenticated to seed data. Please log in first."
      };
    }

    console.log("Authenticated user:", user.id);

    // Create/update parent account
    const parentData = {
      id: user.id,
      name: "Demo Parent Account",
      email: user.email || "demo@happysprout.com",
      relationship: "Parent",
      emergency_contact: "+1-555-0123"
    };

    const { data: parentResult, error: parentError } = await supabase
      .from('parents')
      .upsert([parentData], { onConflict: 'id' })
      .select();

    if (parentError) {
      console.error("Parent creation error:", parentError);
      return {
        success: false,
        error: `Cannot create parent: ${parentError.message}`
      };
    }

    // Create diverse children profiles
    const sampleChildren = [
      {
        id: generateUUID(),
        parent_id: user.id,
        nickname: "Alex",
        age: 8,
        date_of_birth: "2017-03-15",
        grade: "3rd Grade",
        gender: "Non-binary",
        is_assessment_feature_enabled: true
      },
      {
        id: generateUUID(),
        parent_id: user.id,
        nickname: "Maya",
        age: 10,
        date_of_birth: "2015-07-22",
        grade: "5th Grade",
        gender: "Female",
        is_assessment_feature_enabled: true
      },
      {
        id: generateUUID(),
        parent_id: user.id,
        nickname: "Jordan",
        age: 9,
        date_of_birth: "2016-09-30",
        grade: "4th Grade",
        gender: "Male",
        is_assessment_feature_enabled: true
      },
      {
        id: generateUUID(),
        parent_id: user.id,
        nickname: "Sam",
        age: 11,
        date_of_birth: "2014-11-08",
        grade: "6th Grade",
        gender: "Female",
        is_assessment_feature_enabled: true
      },
      {
        id: generateUUID(),
        parent_id: user.id,
        nickname: "River",
        age: 7,
        date_of_birth: "2018-05-12",
        grade: "2nd Grade",
        gender: "Male",
        is_assessment_feature_enabled: true
      },
      {
        id: generateUUID(),
        parent_id: user.id,
        nickname: "Luna",
        age: 12,
        date_of_birth: "2013-09-03",
        grade: "7th Grade",
        gender: "Non-binary",
        is_assessment_feature_enabled: true
      }
    ];

    // Insert children
    const { data: childrenResult, error: childrenError } = await supabase
      .from('children')
      .upsert(sampleChildren, { onConflict: 'id' })
      .select();

    if (childrenError) {
      console.error("Children creation error:", childrenError);
      return {
        success: false,
        error: `Cannot create children: ${childrenError.message}`
      };
    }

    console.log("Created children:", childrenResult);

    // Generate comprehensive SEL insights (90 days of data)
    const selInsights = [];
    const dates = generateDateRange(90);

    // Child-specific baseline scores and improvement patterns
    const childProfiles = {
      'Alex': { 
        baseline: { sa: 0.65, sm: 0.60, soa: 0.70, rs: 0.75, rd: 0.55 }, 
        improvementRate: 0.008, 
        personality: 'steady' 
      },
      'Maya': { 
        baseline: { sa: 0.75, sm: 0.70, soa: 0.80, rs: 0.85, rd: 0.75 }, 
        improvementRate: 0.005, 
        personality: 'achiever' 
      },
      'Jordan': { 
        baseline: { sa: 0.60, sm: 0.65, soa: 0.70, rs: 0.65, rd: 0.60 }, 
        improvementRate: 0.012, 
        personality: 'grower' 
      },
      'Sam': { 
        baseline: { sa: 0.70, sm: 0.75, soa: 0.85, rs: 0.80, rd: 0.70 }, 
        improvementRate: 0.007, 
        personality: 'consistent' 
      },
      'River': { 
        baseline: { sa: 0.55, sm: 0.50, soa: 0.65, rs: 0.70, rd: 0.50 }, 
        improvementRate: 0.015, 
        personality: 'developing' 
      },
      'Luna': { 
        baseline: { sa: 0.80, sm: 0.85, soa: 0.75, rs: 0.90, rd: 0.85 }, 
        improvementRate: 0.003, 
        personality: 'advanced' 
      }
    };

    for (const child of childrenResult || []) {
      const profile = childProfiles[child.nickname as keyof typeof childProfiles];
      if (!profile) continue;

      // Generate 2-3 assessments per week (more realistic)
      const assessmentDates = dates.filter(() => Math.random() < 0.25); // ~25% of days
      
      for (let i = 0; i < assessmentDates.length; i++) {
        const date = assessmentDates[i];
        const daysSinceStart = dates.indexOf(date);
        
        // Calculate progressive improvement with realistic variation
        const improvementFactor = 1 + (daysSinceStart * profile.improvementRate);
        const dailyVariation = randomFloat(0.85, 1.15); // ±15% daily variation
        
        // Add personality-based patterns
        let personalityModifier = 1.0;
        if (profile.personality === 'achiever') {
          personalityModifier = 1.02; // Slight boost
        } else if (profile.personality === 'developing') {
          personalityModifier = Math.random() < 0.3 ? 1.1 : 0.9; // More variable
        }

        const variance = randomFloat(-0.03, 0.03); // Small random variance

        selInsights.push({
          id: generateUUID(),
          child_id: child.id,
          self_awareness: Math.min(1.0, Math.max(0.1, 
            (profile.baseline.sa * improvementFactor * dailyVariation * personalityModifier) + variance
          )),
          self_management: Math.min(1.0, Math.max(0.1, 
            (profile.baseline.sm * improvementFactor * dailyVariation * personalityModifier) + variance
          )),
          social_awareness: Math.min(1.0, Math.max(0.1, 
            (profile.baseline.soa * improvementFactor * dailyVariation * personalityModifier) + variance
          )),
          relationship_skills: Math.min(1.0, Math.max(0.1, 
            (profile.baseline.rs * improvementFactor * dailyVariation * personalityModifier) + variance
          )),
          responsible_decision_making: Math.min(1.0, Math.max(0.1, 
            (profile.baseline.rd * improvementFactor * dailyVariation * personalityModifier) + variance
          )),
          created_at: date,
          source_text: `${profile.personality} assessment #${i + 1} for ${child.nickname}: ${generateSELReflection()}`
        });
      }
    }

    console.log(`Generated ${selInsights.length} SEL insights`);

    // Insert SEL insights in batches
    const batchSize = 20;
    let insertedInsights = 0;
    
    for (let i = 0; i < selInsights.length; i += batchSize) {
      const batch = selInsights.slice(i, i + batchSize);
      const { data: insightsResult, error: insightsError } = await supabase
        .from('sel_insights')
        .insert(batch)
        .select();

      if (insightsError) {
        console.error(`SEL insights batch ${i} error:`, insightsError);
        return {
          success: false,
          error: `Cannot create SEL insights: ${insightsError.message}`
        };
      }

      insertedInsights += insightsResult?.length || 0;
      console.log(`Inserted SEL batch ${Math.floor(i/batchSize) + 1}: ${insightsResult?.length} insights`);
    }

    // Generate diverse journal entries
    const journalEntries = [];
    const moods = ['happy', 'excited', 'calm', 'worried', 'proud', 'grateful'];
    const journalDates = generateDateRange(60); // 60 days of journal entries

    for (const child of childrenResult || []) {
      // Each child writes 2-4 entries per week
      const entryDates = journalDates.filter(() => Math.random() < 0.35);
      
      for (let i = 0; i < entryDates.length; i++) {
        const mood = randomChoice(moods);
        const intensity = Math.floor(randomFloat(2, 6)); // 2-5 intensity
        
        journalEntries.push({
          id: generateUUID(),
          child_id: child.id,
          title: `${child.nickname}'s ${mood} day - ${new Date(entryDates[i]).toLocaleDateString()}`,
          content: generateJournalContent(mood, child.age),
          mood: mood,
          mood_intensity: intensity,
          gratitude: randomChoice([
            "My family and friends",
            "Learning new things",
            "Playing outside",
            "Having food to eat",
            "My teachers",
            "My pet",
            "Books and stories",
            "Music and art",
            "Safe places to play",
            "People who care about me"
          ]),
          confidence: Math.floor(randomFloat(2, 6)),
          created_at: entryDates[i]
        });
      }
    }

    console.log(`Generated ${journalEntries.length} journal entries`);

    // Insert journal entries in batches
    let insertedJournals = 0;
    for (let i = 0; i < journalEntries.length; i += batchSize) {
      const batch = journalEntries.slice(i, i + batchSize);
      const { data: journalResult, error: journalError } = await supabase
        .from('journal_entries')
        .insert(batch)
        .select();

      if (journalError) {
        console.error(`Journal entries batch ${i} error:`, journalError);
        break; // Continue even if journal entries fail
      }

      insertedJournals += journalResult?.length || 0;
      console.log(`Inserted journal batch ${Math.floor(i/batchSize) + 1}: ${journalResult?.length} entries`);
    }

    // Generate user activity logs
    const activityLogs = [];
    const actionTypes = [
      'login',
      'journal_entry', 
      'daily_check_in',
      'assessment_completed',
      'profile_updated',
      'mood_tracked',
      'logout'
    ];

    for (const child of childrenResult || []) {
      const activityDates = dates.filter(() => Math.random() < 0.4); // 40% of days have activity
      
      for (const date of activityDates) {
        // Each active day can have 1-3 activities
        const numActivities = Math.floor(randomFloat(1, 4));
        
        for (let j = 0; j < numActivities; j++) {
          activityLogs.push({
            id: generateUUID(),
            user_id: user.id, // Parent user ID for RLS compliance
            user_type: 'parent',
            action_type: randomChoice(actionTypes),
            action_details: {
              child_id: child.id,
              child_name: child.nickname,
              session_duration: Math.floor(randomFloat(2, 15)), // 2-15 minutes
              completion_rate: randomFloat(0.7, 1.0),
              timestamp: date
            },
            created_at: date
          });
        }
      }
    }

    console.log(`Generated ${activityLogs.length} activity logs`);

    // Insert activity logs
    let insertedLogs = 0;
    for (let i = 0; i < activityLogs.length; i += batchSize) {
      const batch = activityLogs.slice(i, i + batchSize);
      const { data: logsResult, error: logsError } = await supabase
        .from('user_activity_logs')
        .insert(batch)
        .select();

      if (logsError) {
        console.error(`Activity logs batch ${i} error:`, logsError);
        break; // Continue even if logs fail
      }

      insertedLogs += logsResult?.length || 0;
      console.log(`Inserted activity batch ${Math.floor(i/batchSize) + 1}: ${logsResult?.length} logs`);
    }

    const summary = {
      parents: 1,
      children: childrenResult?.length || 0,
      selInsights: insertedInsights,
      journalEntries: insertedJournals,
      activityLogs: insertedLogs,
      timespan: "90 days of SEL data, 60 days of journals",
      diversity: "6 children with unique personalities and growth patterns"
    };

    console.log("✅ Enhanced dummy data seeded successfully!");
    console.log("Summary:", summary);

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error("Error seeding enhanced dummy data:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred"
    };
  }
};

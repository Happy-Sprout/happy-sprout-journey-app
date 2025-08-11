import { supabase } from "@/integrations/supabase/client";

// Generate a UUID v4 string
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Generate dates over the last 90 days
const generateDateRange = (days: number) => {
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }
  return dates;
};

export const seedDummyDataSafe = async () => {
  try {
    console.log("Starting safe dummy data seeding...");

    // First, check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "User must be authenticated to seed data. Please log in first."
      };
    }

    console.log("Authenticated user:", user.id);

    // Check current user's existing data first
    const { data: existingParents, error: parentCheckError } = await supabase
      .from('parents')
      .select('id, name')
      .limit(5);

    if (parentCheckError) {
      console.error("Parent check error:", parentCheckError);
      return {
        success: false,
        error: `Cannot access parents table: ${parentCheckError.message}`
      };
    }

    console.log("Existing parents:", existingParents);

    // Try to create a single parent first to test permissions
    const testParent = {
      id: user.id, // Use the authenticated user's ID
      name: "Demo Parent",
      email: user.email || "demo@example.com",
      relationship: "Parent",
      emergency_contact: "+1-555-0123"
    };

    const { data: parentResult, error: parentError } = await supabase
      .from('parents')
      .upsert([testParent], { onConflict: 'id' })
      .select();

    if (parentError) {
      console.error("Parent creation error:", parentError);
      return {
        success: false,
        error: `Cannot create parent: ${parentError.message}`
      };
    }

    console.log("Parent created/updated:", parentResult);

    // Now create children for this parent
    const sampleChildren = [
      {
        id: generateUUID(),
        parent_id: user.id, // Use authenticated user as parent
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

    console.log("Children created:", childrenResult);

    // Generate SEL insights for the created children
    const selInsights = [];
    const dates = generateDateRange(30); // Last 30 days

    for (const child of childrenResult || []) {
      // Generate 5-8 assessments per child
      const assessmentCount = Math.floor(Math.random() * 4) + 5;
      const assessmentDates = dates
        .sort(() => 0.5 - Math.random())
        .slice(0, assessmentCount)
        .sort();

      for (let i = 0; i < assessmentDates.length; i++) {
        const date = assessmentDates[i];
        
        // Progressive improvement over time
        const progressFactor = 1 + (i * 0.03);
        
        // Base scores for different children
        const baseScores = {
          'Alex': { sa: 0.65, sm: 0.60, soa: 0.70, rs: 0.75, rd: 0.55 },
          'Maya': { sa: 0.70, sm: 0.75, soa: 0.80, rs: 0.85, rd: 0.75 },
          'Jordan': { sa: 0.60, sm: 0.65, soa: 0.70, rs: 0.65, rd: 0.60 }
        };

        const base = baseScores[child.nickname as keyof typeof baseScores] || baseScores.Jordan;
        
        selInsights.push({
          id: generateUUID(),
          child_id: child.id,
          self_awareness: Math.min(1.0, base.sa * progressFactor + (Math.random() * 0.1 - 0.05)),
          self_management: Math.min(1.0, base.sm * progressFactor + (Math.random() * 0.1 - 0.05)),
          social_awareness: Math.min(1.0, base.soa * progressFactor + (Math.random() * 0.1 - 0.05)),
          relationship_skills: Math.min(1.0, base.rs * progressFactor + (Math.random() * 0.1 - 0.05)),
          responsible_decision_making: Math.min(1.0, base.rd * progressFactor + (Math.random() * 0.1 - 0.05)),
          created_at: date,
          source_text: `Demo assessment #${i + 1} for ${child.nickname}`
        });
      }
    }

    console.log(`Generated ${selInsights.length} SEL insights`);

    // Insert SEL insights in batches
    const batchSize = 10;
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
      console.log(`Inserted batch ${i}-${i + batchSize}: ${insightsResult?.length} insights`);
    }

    // Generate some journal entries
    const journalEntries = [];
    const moods = ['happy', 'excited', 'calm', 'grateful', 'proud', 'confident'];
    
    for (const child of childrenResult || []) {
      // 5-10 journal entries per child
      const entryCount = Math.floor(Math.random() * 6) + 5;
      const entryDates = dates
        .sort(() => 0.5 - Math.random())
        .slice(0, entryCount)
        .sort();

      for (let i = 0; i < entryDates.length; i++) {
        journalEntries.push({
          id: generateUUID(),
          child_id: child.id,
          title: `${child.nickname}'s Journal Day ${i + 1}`,
          content: `Today was a meaningful day. I learned something new and spent time reflecting on my feelings.`,
          mood: moods[Math.floor(Math.random() * moods.length)],
          mood_intensity: Math.floor(Math.random() * 5) + 1,
          gratitude: "I'm grateful for my family and friends",
          confidence: Math.floor(Math.random() * 5) + 1,
          created_at: entryDates[i]
        });
      }
    }

    // Insert journal entries
    let insertedJournals = 0;
    for (let i = 0; i < journalEntries.length; i += batchSize) {
      const batch = journalEntries.slice(i, i + batchSize);
      const { data: journalResult, error: journalError } = await supabase
        .from('journal_entries')
        .insert(batch)
        .select();

      if (journalError) {
        console.error(`Journal entries batch ${i} error:`, journalError);
        // Continue even if journal entries fail
        break;
      }

      insertedJournals += journalResult?.length || 0;
    }

    const summary = {
      parents: 1,
      children: childrenResult?.length || 0,
      selInsights: insertedInsights,
      journalEntries: insertedJournals
    };

    console.log("✅ Safe dummy data seeded successfully!");
    console.log("Summary:", summary);

    return {
      success: true,
      summary
    };

  } catch (error) {
    console.error("Error seeding safe dummy data:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred"
    };
  }
};

export const clearDummyDataSafe = async () => {
  try {
    console.log("Starting safe dummy data clearing...");

    // First, check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return {
        success: false,
        error: "User must be authenticated to clear data. Please log in first."
      };
    }

    console.log("Authenticated user:", user.id);

    // Get user's children first
    const { data: userChildren, error: childrenFetchError } = await supabase
      .from('children')
      .select('id')
      .eq('parent_id', user.id);

    if (childrenFetchError) {
      console.error("Error fetching children:", childrenFetchError);
      return {
        success: false,
        error: `Cannot fetch children: ${childrenFetchError.message}`
      };
    }

    const childIds = userChildren?.map(child => child.id) || [];
    console.log(`Found ${childIds.length} children to clear data for`);

    // Clear data in reverse order of dependencies
    let deletedCounts = {
      journalEntries: 0,
      selInsights: 0,
      children: 0,
      activityLogs: 0
    };

    // 1. Clear journal entries for user's children
    if (childIds.length > 0) {
      const { data: deletedJournals, error: journalError } = await supabase
        .from('journal_entries')
        .delete()
        .in('child_id', childIds)
        .select();

      if (journalError) {
        console.error("Journal entries deletion error:", journalError);
      } else {
        deletedCounts.journalEntries = deletedJournals?.length || 0;
        console.log(`Deleted ${deletedCounts.journalEntries} journal entries`);
      }

      // 2. Clear SEL insights for user's children
      const { data: deletedInsights, error: selError } = await supabase
        .from('sel_insights')
        .delete()
        .in('child_id', childIds)
        .select();

      if (selError) {
        console.error("SEL insights deletion error:", selError);
      } else {
        deletedCounts.selInsights = deletedInsights?.length || 0;
        console.log(`Deleted ${deletedCounts.selInsights} SEL insights`);
      }
    }

    // 3. Clear user's children
    const { data: deletedChildren, error: childrenError } = await supabase
      .from('children')
      .delete()
      .eq('parent_id', user.id)
      .select();

    if (childrenError) {
      console.error("Children deletion error:", childrenError);
    } else {
      deletedCounts.children = deletedChildren?.length || 0;
      console.log(`Deleted ${deletedCounts.children} children`);
    }

    // 4. Clear user activity logs
    const { data: deletedLogs, error: logsError } = await supabase
      .from('user_activity_logs')
      .delete()
      .eq('user_id', user.id)
      .select();

    if (logsError) {
      console.error("Activity logs deletion error:", logsError);
    } else {
      deletedCounts.activityLogs = deletedLogs?.length || 0;
      console.log(`Deleted ${deletedCounts.activityLogs} activity logs`);
    }

    console.log("✅ Safe dummy data cleared successfully!");
    console.log("Summary:", deletedCounts);

    return {
      success: true,
      message: "Demo data cleared for current user",
      summary: deletedCounts
    };

  } catch (error) {
    console.error("Error clearing safe dummy data:", error);
    return { 
      success: false, 
      error: error.message || "Unknown error occurred"
    };
  }
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function generateLocalFitnessFallback(userProfile: any) {
  const goal = userProfile.goal || "build_muscle";
  const isMuscle = goal === "build_muscle";
  const isFat = goal === "lose_fat";
  const isHome = userProfile.workout_location === "home";
  
  const weekPlan = [
    {
      day: "Monday",
      muscleGroup: isMuscle ? "Chest & Triceps Push" : isFat ? "High-Intensity Push Metabolic" : "Full Body Conditioning",
      restDay: false,
      warmup: [
        { name: "Arm Circles", targetMuscles: "Shoulders, Rotator Cuff", execution: "Rotate arm forward 15 reps, then reverse", sets: "2", reps: "15 reps", rest: "15s", videoSearch: "athleanx arm circles warm up" },
        { name: "Dynamic Chest Hugs", targetMuscles: "Pectorals, Upper Back", execution: "Cross arms over chest dynamically", sets: "1", reps: "20 reps", rest: "15s", videoSearch: "athleanx chest opening stretch" },
        { name: "Band Pull-Aparts", targetMuscles: "Rear Delts", execution: "Pull resistance band apart across mid-chest", sets: "2", reps: "15 reps", rest: "20s", videoSearch: "jeff nippard band pull aparts" },
        { name: "Scapular Push-ups", targetMuscles: "Serrated anterior", execution: "Hold pushup position, shrug scapula to sink and extend", sets: "2", reps: "12 reps", rest: "30s", videoSearch: "jeff nippard scapular pushups" },
        { name: "Tricep Downward Extensions", targetMuscles: "Triceps head", execution: "Dynamic stretch pushing hands backward repeatedly", sets: "1", reps: "20 reps", rest: "15s", videoSearch: "athleanx dynamic warm up" },
        { name: "Light Pushup Progression", targetMuscles: "Chest, anterior deltoid", execution: "Do slow incline or knee pushups", sets: "2", reps: "10 reps", rest: "30s", videoSearch: "athleanx perfect pushup" }
      ],
      mainExercises: [
        {
          name: isHome ? "Dumbbell Floor Press" : "Barbell Bench Press",
          important: true,
          targetMuscles: "Chest, Triceps, Anterior Delts",
          equipment: isHome ? "Dumbbells" : "Barbell & Bench",
          weight: "12kg each side",
          sets: 4,
          reps: isMuscle ? "8-12" : isFat ? "15-20" : "10-12",
          rest: "90s",
          execution: "Lower under control to 90deg elbow angle, press up forcefully without locking out completely.",
          tips: "Keep shoulder blades retracted and pinned down flat into floor or bench",
          form: "Keep elbows tucked to approximately 45 degrees.",
          mistakes: "Flaring out elbows to 90 degrees which shifts stress onto rear delts.",
          breathing: "Inhale slowly while descending, exhale forcefully upon concentric press",
          videoSearch: "jeff nippard bench flex form checklist"
        },
        {
          name: "Incline Dumbbell Press",
          important: true,
          targetMuscles: "Upper Chest, Anterior Delts",
          equipment: "Dumbbells",
          weight: "10kg each side",
          sets: 3,
          reps: "12",
          rest: "75s",
          execution: "Press weights up from shoulders, squeezing the upper chest together at peak contract.",
          tips: "Avoid clanking weights together at the peak to keep constant tension.",
          form: "Keep a 30-degree incline to maximize chest fiber activation.",
          mistakes: "Setting seat angle too steep resulting in shoulder recruitment.",
          breathing: "Exhale on chest press motion.",
          videoSearch: "athleanx inline dumbbell press proper form"
        },
        {
          name: "Dumbbell Overhead Press",
          important: true,
          targetMuscles: "Shouldered, Triceps",
          equipment: "Dumbbells",
          weight: "8kg each side",
          sets: 3,
          reps: "12",
          rest: "60s",
          execution: "From shoulder level, press dumbbells vertically above head.",
          tips: "Keep core tight to prevent hyper-extending the spine.",
          form: "Do not let forearms flare outward.",
          mistakes: "Arching lower back.",
          breathing: "Exhale on vertical push.",
          videoSearch: "jeff nippard dumbbell overhead shoulder press"
        },
        {
          name: "Dumbbell Lateral Raises",
          important: false,
          targetMuscles: "Lateral Deltoids",
          equipment: "Dumbbells",
          weight: "5kg each side",
          sets: 4,
          reps: "15",
          rest: "60s",
          execution: "Raise dumbbells slightly forward and outward to shoulder height.",
          tips: "Lead with your elbows to prevent upper trap dominance.",
          form: "Maintain slight forward torso lean.",
          mistakes: "Swinging hips to hoist the weights.",
          breathing: "Exhale on abduction raise.",
          videoSearch: "athleanx lateral raises proper form"
        },
        {
          name: "Dumbbell Skull Crushers",
          important: true,
          targetMuscles: "Triceps Long Head",
          equipment: "Dumbbells",
          weight: "6kg each side",
          sets: 3,
          reps: "12-15",
          rest: "60s",
          execution: "Lying flat, bend at elbows to lower dumbbells beside ears, extend back to top.",
          tips: "Ensure upper arms stay locked vertically and static.",
          form: "Point elbows straight up.",
          mistakes: "Moving shoulders.",
          breathing: "Inhale representation down, exhale extending.",
          videoSearch: "jeff nippard skull crushers form guide"
        },
        {
          name: "Tate Press",
          important: false,
          targetMuscles: "Triceps Lateral Head",
          equipment: "Dumbbells",
          weight: "5kg each side",
          sets: 2,
          reps: "12",
          rest: "45s",
          execution: "Press dumbbells up, bend elbows inwards to touch dumbbells to chest before extending.",
          tips: "Focus pure contraction on elbow extension",
          form: "Keep dumbbells close",
          mistakes: "Rushing sets",
          breathing: "Exhale extending elbows",
          videoSearch: "athleanx lockouts and tate press"
        }
      ],
      supersets: [
        {
          dayIndex: 0,
          name: "Push-to-Failure Finisher",
          exerciseA: { name: "Diamond Pushups", targetMuscles: "Triceps, Chest Center", equipment: "Bodyweight", weight: "Bodyweight", sets: 3, reps: "To Failure", rest: "0s", execution: "Pushups with hands forming diamond shape under chest.", tips: "Keep body perfectly straight.", videoSearch: "athleanx perfect diamond pushup" },
          exerciseB: { name: "Dumbbell Overhead Hold", targetMuscles: "Shoulder Stability", equipment: "Dumbbell", weight: "8kg", sets: 3, reps: "30 seconds", rest: "60s", execution: "Hold single heavy dumbbell overhead statically.", tips: "Keep trunk engaged.", videoSearch: "athleanx core overhead walk" }
        }
      ],
      abSupersets: [
        {
          name: "Sleek Core Burner",
          exerciseA: { name: "Lying Leg Raises", targetMuscles: "Lower Abs", equipment: "Floor Mat", weight: "Bodyweight", sets: 3, reps: "15", rest: "0s", execution: "Slowly lift legs to vertical, lower without touching floor.", tips: "Pin lower back flat on floor.", videoSearch: "athleanx leg raises abs" },
          exerciseB: { name: "Russian Twists", targetMuscles: "Obliques", equipment: "Light Weight", weight: "4kg", sets: 3, reps: "20 twists", rest: "45s", execution: "Twist upper body side-to-side holding weight.", tips: "Follow weight with chest.", videoSearch: "athleanx perfect russian twist" }
        }
      ],
      optional: [
        { name: "Single Arm Lateral Raises", important: false, targetMuscles: "Medial Deltoid", equipment: "Dumbbell", weight: "4kg", sets: 2, reps: "15", rest: "45s", execution: "Lean slightly against pole or wall and raises.", tips: "Maximize range of motion.", videoSearch: "jeff nippard lateral raises" }
      ],
      stretching: [
        { name: "Pectoral Doorway Stretch", targetMuscles: "Chest, Shoulders", execution: "Place forearm on doorway and slowly lean chest forward", duration: "30s per side", breathing: "Deep structural breaths", tips: "Relax neck fibers" },
        { name: "Overhead Triceps Stretch", targetMuscles: "Triceps head", execution: "Pull elbow behind head with opposite arm", duration: "30s", breathing: "Steady patterns", tips: "Do not pull neck" },
        { name: "Child Pose Hold", targetMuscles: "Lats, Torso spine", execution: "Reach hands out kneeling flat", duration: "45s", breathing: "Deep belly inhales", tips: "Melt shoulders into floor" },
        { name: "Wrist Flexor Stretch", targetMuscles: "Forearm flexors", execution: "Press hands down backward gently", duration: "15s", breathing: "Slow", tips: "Gentle hold" },
        { name: "Seated Cobra Stretch", targetMuscles: "Core abs", execution: "Press torso up lying prone", duration: "30s", breathing: "Deep stretch", tips: "Do not stress spine" },
        { name: "Wall Chest Angle Stretch", targetMuscles: "Pecs, anterior fibers", execution: "Lay hand flat on wall, rotate body", duration: "30s", breathing: "Flowing", tips: "Stay tall" }
      ]
    },
    {
      day: "Tuesday",
      muscleGroup: isMuscle ? "Back & Biceps Pull" : "Back & Core Pull Intensive",
      restDay: false,
      warmup: [
        { name: "Scapular Pull-ups", targetMuscles: "Lats, Scapula", execution: "Decompress shoulders hanging on bar", sets: "2", reps: "10 reps", rest: "30s", videoSearch: "athleanx shoulder warm ups" },
        { name: "Resisted Band Rows", targetMuscles: "Rhomboids", execution: "Pull band horizontally to ribcage", sets: "2", reps: "15 reps", rest: "20s", videoSearch: "athleanx band row" },
        { name: "Thoracic Windmills", targetMuscles: "Midback spine", execution: "Lie side-lying, rotate arms globally", sets: "1", reps: "10 per side", rest: "15s", videoSearch: "athleanx thoracic spine mobilization" },
        { name: "Arm Circles Warmup", targetMuscles: "Shoulders", execution: "Arm spins clockwise and counter-clockwise", sets: "1", reps: "15 reps", rest: "15s", videoSearch: "athleanx arm circles" },
        { name: "Y-T-W Rotations", targetMuscles: "Lower traps, posture", execution: "Squeeze shoulder blades in letters shapes", sets: "2", reps: "8 reps each", rest: "25s", videoSearch: "jeff nippard posture exercises ytws" },
        { name: "Bicep Bodyweight Decompress", targetMuscles: "Biceps", execution: "Dynamic stretch pulling fingers backward on wall", sets: "1", reps: "15 reps", rest: "15s", videoSearch: "athleanx bicep dynamic stretch" }
      ],
      mainExercises: [
        {
          name: "Single-Arm Dumbbell Row",
          important: true,
          targetMuscles: "Latissimus Dorsi, Rhomboids",
          equipment: "Dumbbell",
          weight: "14kg",
          sets: 4,
          reps: "10-12",
          rest: "75s",
          execution: "Support torso with opposite knee/hand. Pull weight in arc toward hip.",
          tips: "Keep shoulder down, pull with elbow not with wrist.",
          form: "Keep spine straight and parallel to floor.",
          mistakes: "Yanking weight upwards rounding back.",
          breathing: "Exhale on pull upward.",
          videoSearch: "athleanx single arm row mistake"
        },
        {
          name: "Dumbbell Pullovers",
          important: true,
          targetMuscles: "Lats, Upper Chest",
          equipment: "Dumbbells",
          weight: "12kg",
          sets: 3,
          reps: "12",
          rest: "60s",
          execution: "Lie flat on floor or bench, raise dumbbell over face and lower behind head keeping micro elbow bend.",
          tips: "Feel lat stretch at bottom, squeeze pull with underarms.",
          form: "Keep core locked tight.",
          mistakes: "Bending elbows too much turning it into a tricep kickback.",
          breathing: "Inhale lowering, exhale pulling over.",
          videoSearch: "jeff nippard lat pullover form"
        },
        {
          name: "Reverse Flyes",
          important: false,
          targetMuscles: "Rear Deltoids, Rhomboids",
          equipment: "Dumbbells",
          weight: "5kg each side",
          sets: 3,
          reps: "15",
          rest: "60s",
          execution: "Hinge at hips, raise weights outwards squeezing shoulder blades together.",
          tips: "Keep pinky fingers pointing slightly upwards.",
          form: "Keep back perfectly flat.",
          mistakes: "Using momentum shaking torso.",
          breathing: "Exhale raising.",
          videoSearch: "athleanx rear delt fly dumbbell"
        },
        {
          name: "Incline Dumbbell Shrugs",
          important: false,
          targetMuscles: "Upper Trapezius",
          equipment: "Dumbbells",
          weight: "12kg each side",
          sets: 3,
          reps: "12",
          rest: "45s",
          execution: "Sit facing chest down on incline bench (or chest supported), shrugged shoulders backward.",
          tips: "Squeeze traps at contraction.",
          form: "Slight lean forward is optimal.",
          mistakes: "Rolling shoulders in circular path.",
          breathing: "Exhale raising.",
          videoSearch: "athleanx shrug mistakes"
        },
        {
          name: "Dumbbell Bicep Hammer Curls",
          important: true,
          targetMuscles: "Brachioradialis, Brachialis",
          equipment: "Dumbbells",
          weight: "8kg each side",
          sets: 3,
          reps: "12",
          rest: "60s",
          execution: "Raise dumbbells with neutral palms (thumbs pointing upwards).",
          tips: "Keep elbow locked to your side.",
          form: "Do not let elbow move forward.",
          mistakes: "Using momentum or swinging body.",
          breathing: "Exhale raising curling.",
          videoSearch: "jeff nippard hammer curls science"
        },
        {
          name: "Incline Alternate Curls",
          important: false,
          targetMuscles: "Biceps Short Head",
          equipment: "Dumbbells",
          weight: "6kg each side",
          sets: 3,
          reps: "12 per side",
          rest: "60s",
          execution: "Supinate wrists as you raise weights to maximize biceps peaks.",
          tips: "Maintain vertical arms backward alignment.",
          form: "Keep chest proud.",
          mistakes: "Letting elbows flare.",
          breathing: "Exhale on contraction.",
          videoSearch: "athleanx incline bicep curl"
        }
      ],
      supersets: [
        {
          dayIndex: 1,
          name: "Pull Burner Super",
          exerciseA: { name: "Prone Incline row", targetMuscles: "Middle back", equipment: "Dumbbells", weight: "8kg each", sets: 3, reps: "15", rest: "0s", execution: "Lie chest down row dumbbells aggressively.", tips: "Keep elbows high.", videoSearch: "jeff nippard row form" },
          exerciseB: { name: "Bicep Isometric Hold", targetMuscles: "Bicep Peak", equipment: "Dumbbell", weight: "8kg each", sets: 3, reps: "30s", rest: "60s", execution: "Hold dumbbells at 90-degree forearm angle statically.", tips: "Squeeze biceps hard.", videoSearch: "athleanx bicep peaks" }
        }
      ],
      abSupersets: [
        {
          name: "Posterior Core Shred",
          exerciseA: { name: "Bird Dog", targetMuscles: "Spinal Erectors, Glutes", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "12 per arm", rest: "0s", execution: "Extend opposite arm & leg on hands and knees.", tips: "Keep hips level.", videoSearch: "athleanx bird dog" },
          exerciseB: { name: "Plank Shoulder Taps", targetMuscles: "Anti-Rotation Core", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "20 total", rest: "45s", execution: "In pushup plank position tap alternate shoulders.", tips: "Do not shake torso.", videoSearch: "athleanx plank shoulder taps" }
        }
      ],
      optional: [
        { name: "Spider Curls", important: false, targetMuscles: "Short Head Bicep", equipment: "Dumbbells", weight: "5kg each", sets: 2, reps: "12", rest: "45s", execution: "Dangle arms vertically curl weight under control.", tips: "Do not shift shoulders.", videoSearch: "jeff nippard spider curl" }
      ],
      stretching: [
        { name: "Lat Doorway Decompression", targetMuscles: "Lats, Side body", execution: "Hold hand support twist body to decompress side", duration: "30s per side", breathing: "Deep structural bellows", tips: "Melt ribs" },
        { name: "Seated Spine Twist Stretch", targetMuscles: "Thoracic spine, Back", execution: "Twist spine sitting down chest tall", duration: "30s each", breathing: "Slow steady", tips: "Grow tall" },
        { name: "Biceps Wall Extension Stretch", targetMuscles: "Bicep, chest connection", execution: "Fingers flat on wall rotate shoulders backward", duration: "30s each", breathing: "Exhaling tension", tips: "Gentle torque" },
        { name: "Thread the Needle", targetMuscles: "Upper back, shoulders", execution: "Push arm flat horizontally prone", duration: "30s", breathing: "Calming", tips: "Melt head down" },
        { name: "Cat Cow Flows", targetMuscles: "Spine back complex", execution: "Flex and extend spine slowly on knees", duration: "45s", breathing: "Inhale on Cow, exhale on Cat", tips: "Move fluidly" },
        { name: "Forearm Flexor Stretch", targetMuscles: "Forearms", execution: "Pulls fingers downward back", duration: "15s per side", breathing: "Deep", tips: "Gently" }
      ]
    },
    {
      day: "Wednesday",
      muscleGroup: "Active Recovery & Mobility Day",
      restDay: true,
      warmup: [],
      mainExercises: [],
      supersets: [],
      abSupersets: [],
      optional: [],
      stretching: []
    },
    {
      day: "Thursday",
      muscleGroup: isMuscle ? "Quad & Glute Power Base" : "Lower Body Shred & Conditioning",
      restDay: false,
      warmup: [
        { name: "Bodyweight Squats", targetMuscles: "Quads, Glutes", execution: "Frictionless full body squats", sets: "2", reps: "15 reps", rest: "20s", videoSearch: "athleanx squats warm up" },
        { name: "Decompression Glute Bridges", targetMuscles: "Glutes, Hamstrings", execution: "Lift hips squeeze glutes on mat", sets: "2", reps: "12 reps", rest: "20s", videoSearch: "jeff nippard glute bridge dynamic" },
        { name: "Leg Swings Side-to-side", targetMuscles: "Hips, Gluteus medius", execution: "Swing leg widely left-right holding wall", sets: "1", reps: "15 each", rest: "15s", videoSearch: "athleanx hip alignment mobility" },
        { name: "Deep Goblet Squat Hold", targetMuscles: "Hip adductors", execution: "Hold bottom position of deep squat", sets: "1", reps: "45s stretch", rest: "20s", videoSearch: "jeff nippard squat alignment check" },
        { name: "Ankle Mobility Wall Rocks", targetMuscles: "Calves, tendons", execution: "Press knee forward close to wall", sets: "2", reps: "10 rocks each", rest: "15s", videoSearch: "athleanx ankle mobility checklist" },
        { name: "Reverse Lunge Step warmups", targetMuscles: "Hams, quads", execution: "In-place lunge backward dynamically", sets: "1", reps: "12 per leg", rest: "15s", videoSearch: "athleanx reverse lunge" }
      ],
      mainExercises: [
        {
          name: "Goblet Squats",
          important: true,
          targetMuscles: "Quadriceps, Gluteus Maximus",
          equipment: "Dumbbell",
          weight: "16kg",
          sets: 4,
          reps: isMuscle ? "10-12" : "15-20",
          rest: "90s",
          execution: "Cradle dumbbell vertically near clavicles. Sit hips backward below parallel keeping spine neutral.",
          tips: "Keep weight centered over midfoot, push knees outward at bottom.",
          form: "Elevate heels with 1-inch plates if ankle mobility is tight.",
          mistakes: "Caving knees inward (valgus collapse) rising up.",
          breathing: "Inhale descent, exhale pressing.",
          videoSearch: "athleanx goblet squat mistakes"
        },
        {
          name: "Romanian Dumbbell Deadlift",
          important: true,
          targetMuscles: "Hamstrings, Spinal Erectors, Glutes",
          equipment: "Dumbbells",
          weight: "12kg each side",
          sets: 4,
          reps: "12",
          rest: "75s",
          execution: "Unlock knees slightly, hinge back at hips lowering the DBs close along shin bone.",
          tips: "Stop descending once hips stop moving backward. Keep shoulder blades back.",
          form: "Keep dumbbells grazing your thighs.",
          mistakes: "Rounding the upper/mid back to attempt reaching further down.",
          breathing: "Inhale bending forward, exhale snapping hips forward.",
          videoSearch: "jeff nippard perfected rdl"
        },
        {
          name: "Bulgarian Split Squats",
          important: true,
          targetMuscles: "Quadriceps, Glute Min/Med",
          equipment: "Dumbbells",
          weight: "8kg each side",
          sets: 3,
          reps: "10 per leg",
          rest: "75s",
          execution: "Place single training foot back on chair/stair. Lower rear knee slowly.",
          tips: "Torso vertical focuses quads; leaning slightly forward engages glutes.",
          form: "Keep front knee aligned over pinky toe.",
          mistakes: "Front heel raising off the floor.",
          breathing: "Exhale pushing upward.",
          videoSearch: "athleanx split squat bulgarian checklist"
        },
        {
          name: "Dumbbell Calf Raises (Standing)",
          important: false,
          targetMuscles: "Gastrocnemius, Soleus",
          equipment: "Dumbbells",
          weight: "12kg each side",
          sets: 4,
          reps: "20",
          rest: "45s",
          execution: "Elevated toe boxes raise calves vertically under a full 2-second hold at peak.",
          tips: "Control downward stretch fully.",
          form: "Hold pole for balance if needed.",
          mistakes: "Bouncing too quickly without holding peaks.",
          breathing: "Exhale rising vertical.",
          videoSearch: "jeff nippard massive calves research"
        },
        {
          name: "Single-Leg Glute Bridges",
          important: false,
          targetMuscles: "Gluteus Maximus",
          equipment: "Mat",
          weight: "Bodyweight",
          sets: 3,
          reps: "12 per side",
          rest: "60s",
          execution: "Lie flat on back, elevate single leg upward, raise hips squeezing glutes.",
          tips: "Drive force completely flat through loaded heel.",
          form: "Keep hips square.",
          mistakes: "Using mid back momentum.",
          breathing: "Exhale at full contraction.",
          videoSearch: "athleanx glute bridges tutorial"
        },
        {
          name: "Tibialis Raises",
          important: false,
          targetMuscles: "Tibialis Anterior",
          equipment: "Wall",
          weight: "Bodyweight",
          sets: 2,
          reps: "25",
          rest: "30s",
          execution: "Stand with butt on wall, legs forward. Pull toes up dynamically.",
          tips: "Reduces knee pain and builds shin safety.",
          form: "Lock knees smooth",
          mistakes: "Bending knees",
          breathing: "Steady control",
          videoSearch: "kneesovertoesguy tibialis raise"
        }
      ],
      supersets: [
        {
          dayIndex: 3,
          name: "Quadricep Burner Quad Extender",
          exerciseA: { name: "Air Squats Static Hold", targetMuscles: "Quadriceps Endurance", equipment: "None", weight: "Bodyweight", sets: 3, reps: "45 seconds", rest: "0s", execution: "Hold 90-degree parallel squat position statically.", tips: "Keep shoulders over heels", videoSearch: "athleanx static squat burn" },
          exerciseB: { name: "Step Ups in Place", targetMuscles: "Quads, Core Stabilization", equipment: "None", weight: "Bodyweight", sets: 3, reps: "15 reps each", rest: "60s", execution: "Drive alternating knees up to high chair.", tips: "Push heel down cleanly.", videoSearch: "athleanx perfect stepups" }
        }
      ],
      abSupersets: [
        {
          name: "Core Balance Finisher",
          exerciseA: { name: "Plank Hold", targetMuscles: "Transverse Abdominis", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "60 seconds", rest: "0s", execution: "Brace elbows flat holding core strictly level.", tips: "Squeeze glutes and abs to avoid lumbar sagging.", videoSearch: "athleanx perfect plank structure" },
          exerciseB: { name: "Oblique Heel Taps", targetMuscles: "Internal Obliques", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "20 twists", rest: "45s", execution: "Prone shoulders off floor reach fingers to heels alternating", tips: "Exhale touching heels.", videoSearch: "athleanx oblique heel touch" }
        }
      ],
      optional: [
        { name: "Weighted Goblet Lunges", important: false, targetMuscles: "Hamstrings, Glutes", equipment: "Dumbbell", weight: "10kg", sets: 2, reps: "10 per leg", rest: "45s", execution: "Hold goblet state step backward alternated.", tips: "Avoid rear knee crashing.", videoSearch: "jeff nippard back lunges" }
      ],
      stretching: [
        { name: "Kneeling Quadricep Hip Opener", targetMuscles: "Hip Flexors, Quads", execution: "Kneel lunging forward pull opposite foot back", duration: "30s per leg", breathing: "Slow belly deep cooling", tips: "Stay erect" },
        { name: "Hamstring Sitting Pike Stretch", targetMuscles: "Hamstrings, Calves", execution: "Reach fingers down seated to straight toes", duration: "45s flat", breathing: "Regulated flow", tips: "Hinge from hip, do not round back" },
        { name: "Figure-Four Glute Twist", targetMuscles: "Gluteus Medius, Piriformis", execution: "Cross ankle over knee seated and hug", duration: "30s each", breathing: "Deep", tips: "Bridges spine tall" },
        { name: "Butterfly Stretch Hip Release", targetMuscles: "Adductors, groin", execution: "Press soles together pull thighs close down", duration: "30s", breathing: "Slowly", tips: "Never speed bounce" },
        { name: "Calf Wall Push Stretch", targetMuscles: "Calves Achilles", execution: "Step back push heel completely flat to wall floor", duration: "30s", breathing: "Inhale", tips: "Keep knee straight" },
        { name: "Hip Adductor Side Stretch", targetMuscles: "Adductors", execution: "Lean widely on knee to side", duration: "15s each", breathing: "Relaxed", tips: "Stay broad" }
      ]
    },
    {
      day: "Friday",
      muscleGroup: isMuscle ? "Shoulder & Arm Shaper Deluxe" : "Hyper-Intense Cardiorespiratory Metabolic",
      restDay: false,
      warmup: [
        { name: "Overhead Band Dislocators", targetMuscles: "Rotator cuff, Shoulders", execution: "Rotate band widely over hip back", sets: "2", reps: "12", rest: "15s", videoSearch: "jeff nippard shoulder prep" },
        { name: "Wrist Rolls dynamic", targetMuscles: "Wrist tendons flexors", execution: "Unlock knuckles rotate in orbit", sets: "1", reps: "20", rest: "15s", videoSearch: "athleanx wrist prep" },
        { name: "Scapular Wall Slides", targetMuscles: "Upper Traps, Lower back rhomboid", execution: "Keep back/arms flat on wall slide up", sets: "2", reps: "10", rest: "20s", videoSearch: "jeff nippard scapular wall slides" },
        { name: "Arm Circles Horizontal", targetMuscles: "Deltoid complex", execution: "Orbit circles 15 forward then back", sets: "1", reps: "15", rest: "15s", videoSearch: "athleanx arm warmup" },
        { name: "Pushup Shoulder Tap progressive", targetMuscles: "Upper body rotators", execution: "Light incline pushups touch shoulders", sets: "2", reps: "8 reps each", rest: "30s", videoSearch: "athleanx core stabilization pushup" },
        { name: "Bicep Elastic Release stretch", targetMuscles: "Bicep tendon", execution: "Reach hands backwards dynamically", sets: "1", reps: "15", rest: "15s", videoSearch: "jeff nippard biceps prepare" }
      ],
      mainExercises: [
        {
          name: "Dumbbell Arnold Press",
          important: true,
          targetMuscles: "Anterior Delts, Lateral Delts",
          equipment: "Dumbbells",
          weight: "10kg each side",
          sets: 3,
          reps: "12",
          rest: "75s",
          execution: "Hold dumbbells in close under chin cuffs palms in. Press overhead rotating palms outward.",
          tips: "Control concentric and eccentric rotations purely without rushing.",
          form: "Keep sitting straight line background.",
          mistakes: "Splaying elbows excessively wide.",
          breathing: "Exhale pressing skyward.",
          videoSearch: "athleanx arnold press proper rotation"
        },
        {
          name: "Incline Bicep Curls",
          important: true,
          targetMuscles: "Biceps Main Long Head",
          equipment: "Dumbbells",
          weight: "8kg each side",
          sets: 3,
          reps: "12",
          rest: "60s",
          execution: "Lying tilted backward curl weights up without shifting elbows forward out of vertical axis.",
          tips: "Long head gets stretched deeply at bottom structure.",
          form: "Keep head pinned back.",
          mistakes: "Leveraging bodyweight to sway up weights.",
          breathing: "Exhale on curl contraction.",
          videoSearch: "jeff nippard incline curl science explanation"
        },
        {
          name: "Overhead Dumbbell Tricep Extension",
          important: true,
          targetMuscles: "Triceps Long Head",
          equipment: "Dumbbells",
          weight: "14kg",
          sets: 3,
          reps: "12",
          rest: "60s",
          execution: "Hold dumbbell with both hands diamond-gripped under top plate overhead, bend elbows lowering behind scalp.",
          tips: "Keep elbows pointed inward safely, do not flare out wider than shoulder alignment.",
          form: "Brace abs tightly to keep neutral lumbar curve.",
          mistakes: "Letting elbows flare excessively outward or ignoring lower back hyperextension.",
          breathing: "Exhale extending elbows skyward.",
          videoSearch: "athleanx overhead extension overhead"
        },
        {
          name: "Cheated Eccentric Bicep Curls",
          important: false,
          targetMuscles: "Biceps peak, brachii",
          equipment: "Dumbbells",
          weight: "10kg each side",
          sets: 3,
          reps: "8 reps",
          rest: "60s",
          execution: "Hoist dumbbells slightly cheating on concentric, then descend extremely slowly taking full 5 seconds.",
          tips: "Maximize mechanical breakdown of muscle fibers during slow eccentric descent.",
          form: "Firm base stand",
          mistakes: "Crashing down weight immediately without resisting gravity.",
          breathing: "Inhale slowly during controlled descent.",
          videoSearch: "jeff nippard cheating curls form"
        },
        {
          name: "Bench Tricep Dips",
          important: true,
          targetMuscles: "Triceps, Chest Lower, Shoulders",
          equipment: "Chair",
          weight: "Bodyweight",
          sets: 3,
          reps: "15",
          rest: "60s",
          execution: "Place hands behind hip edges on chair body forward. Bend elbow down to 90deg, press vertical.",
          tips: "Keep back very close to bench to protect rotate cuffs.",
          form: "Keep shoulder blades depressed.",
          mistakes: "Descending too deep (lower than 90 angle) injuring anterior shoulder joint.",
          breathing: "Exhale forcing upward extensions.",
          videoSearch: "athleanx perfect bench dips"
        },
        {
          name: "Wrist Curls (Supinated)",
          important: false,
          targetMuscles: "Forearm Flexors",
          equipment: "Dumbbells",
          weight: "6kg each side",
          sets: 2,
          reps: "20",
          rest: "45s",
          execution: "Rest back arm on thigh with wrist hanging over knee, roll dumbbells down on fingers, squeeze roll up.",
          tips: "Builds iron grip strength.",
          form: "Keep forearm pinned flat",
          mistakes: "Using body swing rotation",
          breathing: "Exhale curling wrist upward",
          videoSearch: "athleanx forearm massizer"
        }
      ],
      supersets: [
        {
          dayIndex: 4,
          name: "Arm Shred Super Isolation",
          exerciseA: { name: "Reverse grip Forearm curls", targetMuscles: "Extensors, Forearms", equipment: "Dumbbells", weight: "4kg each", sets: 3, reps: "15", rest: "0s", execution: "Dumbbells palms facing down curl wrists up.", tips: "Keep forearms solid.", videoSearch: "jeff nippard forearm development" },
          exerciseB: { name: "Bicep Inner concentration Curls", targetMuscles: "Short Head Peak", equipment: "Dumbbell", weight: "6kg", sets: 3, reps: "12 each side", rest: "45s", execution: "Sit, hinge arm inside knee, curl weight towards chest.", tips: "Focus completely on biceps crunch.", videoSearch: "athleanx perfect concentration curl" }
        }
      ],
      abSupersets: [
        {
          name: "Transv-Oblique Finisher",
          exerciseA: { name: "Plank Body Saws", targetMuscles: "Deep Core stability", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "15 slides", rest: "0s", execution: "In plank position, rock toes forward and backward shifting mass.", tips: "Anchor core tight.", videoSearch: "athleanx body saws core" },
          exerciseB: { name: "Alternating Russian Twists", targetMuscles: "Obliques", equipment: "Light Weight", weight: "2.5kg", sets: 3, reps: "30 reps", rest: "45s", execution: "Twist chest aggressively side to side touching plate.", tips: "Protect lumbar brace.", videoSearch: "athleanx russian twist correct" }
        }
      ],
      optional: [
        { name: "Standing Hammer curl extensions", important: false, targetMuscles: "Brachialis muscle", equipment: "Dumbbells", weight: "8kg each", sets: 2, reps: "12", rest: "45s", execution: "Lock elbows swing arms neutral curl.", tips: "Shoulders straight.", videoSearch: "athleanx hammer curls" }
      ],
      stretching: [
        { name: "Doorway Upper Biceps stretch", targetMuscles: "Biceps connection", execution: "Turn torso away from shoulder holding doorway", duration: "30s each", breathing: "Slow shallow flows", tips: "Gently torque" },
        { name: "Forearm Extensor Release", targetMuscles: "Wrist extensors", execution: "Flex fingers down internally pull back gently", duration: "30s", breathing: "Regulated", tips: "Maintain comfort" },
        { name: "Overhead Tricep deep pull stretch", targetMuscles: "Triceps", execution: "Pull arm behind shoulder line seated", duration: "30s", breathing: "Flowing", tips: "Stay straight" },
        { name: "Shoulder Cross-Body Stretch", targetMuscles: "Rear Deltoid", execution: "Sling arm horizontally pull tight", duration: "30s", breathing: "Deep comfort", tips: "Melt shoulder low" },
        { name: "Floor Cobra stretch", targetMuscles: "Abdominal walls", execution: "Press hand on mat extend spine", duration: "30s", breathing: "Rhythm deep", tips: "Unroll ribs" },
        { name: "Sphinx pose static", targetMuscles: "Lats spinal column", execution: "Hold elbows down floor lift head", duration: "30s", breathing: "Cool down", tips: "Melt lumbar" }
      ]
    },
    {
      day: "Saturday",
      muscleGroup: isMuscle ? "Posterior Leg & Calf developer" : "Weekend Calisthenics Core Shaper",
      restDay: false,
      warmup: [
        { name: "Squat-to-Stand mobility", targetMuscles: "Hamstrings, Hips", execution: "Pike down, grip toes, drop hips deep and repeat", sets: "2", reps: "10 rocks", rest: "20s", videoSearch: "athleanx lower body mobility" },
        { name: "Kossack Squat dynamic flow", targetMuscles: "Hip adductors", execution: "Wide stance side lunge slide left-right", sets: "2", reps: "8 per side", rest: "20s", videoSearch: "jeff nippard kossack squats" },
        { name: "Walking Glute Hugs", targetMuscles: "Posterior glutes", execution: "Walk while bringing alternating knee to chest and hug", sets: "1", reps: "15 reps", rest: "15s", videoSearch: "athleanx legs stretch warmup" },
        { name: "Thoracic Rotate Quadruped", targetMuscles: "Torso spine", execution: "Rotate arm to celling on all fours", sets: "1", reps: "10 each", rest: "15s", videoSearch: "athleanx core backup" },
        { name: "Ankle Circles dynamic", targetMuscles: "Ankle stabilization", execution: "Spin ankle circles clockwise", sets: "1", reps: "20 spins", rest: "15s", videoSearch: "athleanx anodes" },
        { name: "Bird Dogs progressive", targetMuscles: "Lower Back core", execution: "Kneel extend alternating digits", sets: "2", reps: "10 each", rest: "20s", videoSearch: "athleanx bird dog" }
      ],
      mainExercises: [
        {
          name: "Stiff Leg Romanian Deadlifts",
          important: true,
          targetMuscles: "Hamstrings, Lower Back, Glutes",
          equipment: "Dumbbells",
          weight: "12kg each side",
          sets: 4,
          reps: "12",
          rest: "90s",
          execution: "Hinge backward actively from hip socket with locked knee joint position (with just 5% microbend). Track weight close.",
          tips: "Pin back strictly straight do not let lumbar flex or drop.",
          form: "Keep weights tight along shins.",
          mistakes: "Rounding back to attempt reaching further or bending knees excessively.",
          breathing: "Exhale snapped glutes together vertically.",
          videoSearch: "jeff nippard hamstrings RDL"
        },
        {
          name: "Walking Lunges (Weighted)",
          important: true,
          targetMuscles: "Quadriceps, Glutes Hamstrings",
          equipment: "Dumbbells",
          weight: "10kg each side",
          sets: 3,
          reps: "20 steps total",
          rest: "75s",
          execution: "Step forward under control in alternating sequence. Do not let lead knee slide beyond toes.",
          tips: "A longer step utilizes more glutes, standard step utilizes more quadriceps.",
          form: "Keep step length consistent.",
          mistakes: "Letting knees wobble inside.",
          breathing: "Exhale driving up from step.",
          videoSearch: "athleanx perfect stepping lunges"
        },
        {
          name: "Dumbbell Calf Raises (Seated)",
          important: false,
          targetMuscles: "Soleus muscle, Achilles",
          equipment: "Dumbbells",
          weight: "14kg",
          sets: 4,
          reps: "15",
          rest: "45s",
          execution: "Sit, rest dumbbell on forward thigh block, elevate toes from block holding extreme stretch.",
          tips: "Soleus responds beautifully to deep control seated raises.",
          form: "Sit erect inline",
          mistakes: "Letting dumbbell slide inside",
          breathing: "Exhale stretching toes",
          videoSearch: "athleanx calf developer"
        },
        {
          name: "Weight goblet Glute step backs",
          important: false,
          targetMuscles: "Gluteus Maximus",
          equipment: "Dumbbell",
          weight: "12kg",
          sets: 3,
          reps: "12 per leg",
          rest: "60s",
          execution: "Step rear 45deg backwards holding weight in front.",
          tips: "Focus torque on hamstring/glute folds.",
          form: "Core locked straight",
          mistakes: "Bouncing hips",
          breathing: "Exhale rising",
          videoSearch: "athleanx side lunges"
        },
        {
          name: "Single-leg weighted Calf stand",
          important: false,
          targetMuscles: "Gastrocnemius",
          equipment: "Dumbbell",
          weight: "6kg",
          sets: 3,
          reps: "12 reps each",
          rest: "45s",
          execution: "Lift one leg, perform single calf elevator stand under loaded side.",
          tips: "Balance holding wall gently.",
          form: "Unmatched calves stabilizer.",
          mistakes: "Dropping ankle rapidly.",
          breathing: "Exhale vertical stretch.",
          videoSearch: "jeff nippard single leg calf raises"
        },
        {
          name: "Frog Pumps",
          important: false,
          targetMuscles: "Gluteus Maximus",
          equipment: "Mat",
          weight: "Bodyweight",
          sets: 2,
          reps: "30",
          rest: "30s",
          execution: "Soles of feet together, knees flared widely, lift pelvis squeezing the glutes.",
          tips: "Tuck chin looking forward.",
          form: "High rep burnout.",
          mistakes: "Hip hyper-extending.",
          breathing: "Exhale moving hips.",
          videoSearch: "bret contreras frog pumps"
        }
      ],
      supersets: [
        {
          dayIndex: 5,
          name: "Posterior Leg Shred Burnout",
          exerciseA: { name: "Single Leg squats to chair", targetMuscles: "Quadriceps stability", equipment: "Chair", weight: "Bodyweight", sets: 3, reps: "10 per leg", rest: "0s", execution: "Pistol squat slowly down to touch chair and rise.", tips: "Push flat through sole.", videoSearch: "athleanx pistol squat guide" },
          exerciseB: { name: "Ankle Hops Plyos", targetMuscles: "Calves Achilles snap", equipment: "None", weight: "Bodyweight", sets: 3, reps: "45 seconds", rest: "60s", execution: "Jump in place bouncing strictly using calves ankle elasticity.", tips: "Keep knees stiff.", videoSearch: "jeff nippard calves plyometrics" }
        }
      ],
      abSupersets: [
        {
          name: "Lower Ab Core Cruncher",
          exerciseA: { name: "Reverse crunch", targetMuscles: "Rectus abdominus", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "15 reps", rest: "0s", execution: "Perform slow reverse tuck curls bringing knees to chin.", tips: "Do not swing legs.", videoSearch: "athleanx reverse crunch" },
          exerciseB: { name: "Alternating Russian twists", targetMuscles: "Obliques core alignment", equipment: "Mat", weight: "Bodyweight", sets: 3, reps: "25 total", rest: "45s", execution: "Twist side to side rapidly.", tips: "Protect trunk brace.", videoSearch: "athleanx russian twists" }
        }
      ],
      optional: [
        { name: "Single Leg deadlifts in place", important: false, targetMuscles: "Hamstrings, stabilizing core", equipment: "Dumbbells", weight: "8kg", sets: 2, reps: "10", rest: "45s", execution: "Reach leg backward hinge hips forward return.", tips: "Keep hips square.", videoSearch: "jeff nippard single leg rdl" }
      ],
      stretching: [
        { name: "Glute seated cross leg stretch", targetMuscles: "Glute complex", execution: "Seat, hug crossed leg tight against chest", duration: "30s per leg", breathing: "Slow cooling breaths", tips: "Back straight" },
        { name: "Hamstring deep towel stretch", targetMuscles: "Hamstrings", execution: "Lie flat pull straight leg close using towel", duration: "45s", breathing: "Letting go on exhale", tips: "Relax calf" },
        { name: "Pigeon hip stretch pose", targetMuscles: "Piriformis muscle", execution: "Sling leg horizontally cross floor fold", duration: "30s per leg", breathing: "Regulated breathing", tips: "Melt glutes down" },
        { name: "Standing Quads pull stretching", targetMuscles: "Quadriceps front", execution: "Step back grasp ankle pull behind static", duration: "30s", breathing: "Calming", tips: "Keep hip locked" },
        { name: "Calf stretch bent knee", targetMuscles: "Soleus calf fibers", execution: "Push toes on base bend knees forward", duration: "30s", breathing: "Relaxed", tips: "Feel deep lower stretch" },
        { name: "Groin side splits stretch", targetMuscles: "Adductors, groin", execution: "Drop groin side floor", duration: "15s each", breathing: "Slower", tips: "Calming" }
      ]
    },
    {
      day: "Sunday",
      muscleGroup: "Active Rest, Walk & Systemic Recovery",
      restDay: true,
      warmup: [],
      mainExercises: [],
      supersets: [],
      abSupersets: [],
      optional: [],
      stretching: []
    }
  ];
  
  return { weekPlan };
}

export function generateLocalDietFallback(userProfile: any, calorieTarget: number) {
  const p = Math.round(calorieTarget * 0.35 / 4);
  const c = Math.round(calorieTarget * 0.45 / 4);
  const f = Math.round(calorieTarget * 0.20 / 9);
  
  const weekPlan = [
    {
      day: "Monday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "High Protein Banana Oats", prepTime: "10 mins", ingredients: ["60g rolled oats", "1 scoop vanilla protein powder", "1 medium banana", "200ml skimmed milk", "10g chia seeds"], instructions: "Mix oats and milk, microwave for 2 minutes. Stir in protein powder, top with sliced banana and chia seeds.", calories: Math.round(calorieTarget * 0.25), protein_g: Math.round(p * 0.25), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.18), videoSearch: "home cooking show high protein breakfast banana oats" },
        { mealType: "Mid-morning Snack", name: "Greek Yogurt & Berries", prepTime: "5 mins", ingredients: ["200g fat-free Greek yogurt", "50g fresh blueberries", "15g dry almonds", "5g honey drizzle"], instructions: "In a bowl, layer Greek yogurt, top with Blueberries, chopped almonds, and a light honey drizzle.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.08), fat_g: Math.round(f * 0.15), videoSearch: "greek yogurt breakfast parfait live lean" },
        { mealType: "Lunch", name: "Lean Chicken Rice & Broccoli", prepTime: "15 mins", ingredients: ["150g grilled chicken breast", "100g cooked basmati rice", "100g steamed broccoli florets", "1 tsp olive oil for sautéing"], instructions: "Plate cooked rice. Sauté seasoned chicken in olive oil. Serve beside broccoli drizzled with light lemon.", calories: Math.round(calorieTarget * 0.30), protein_g: Math.round(p * 0.32), carbs_g: Math.round(c * 0.30), fat_g: Math.round(f * 0.25), videoSearch: "max euceda meal prep chicken brown rice broccoli" },
        { mealType: "Evening Snack", name: "Whey shake & Salted Rice Cakes", prepTime: "5 mins", ingredients: ["1 scoop whey concentrate isolate", "2 salted brown rice cakes", "10g organic peanut butter"], instructions: "Blend whey powder with ice water. Spread organic peanut butter evenly on rice cakes and enjoy.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.16), carbs_g: Math.round(c * 0.09), fat_g: Math.round(f * 0.15), videoSearch: "protein shake and rice cakes post workout snack" },
        { mealType: "Dinner", name: "Seasoned Baked Salmon & Sweet Potato", prepTime: "20 mins", ingredients: ["120g wild baked salmon fillet", "120g roasted sweet potato cubes", "150g fresh asparagus spears", "1 tsp healthy olive oil"], instructions: "Bake salmon at 200°C for 15 minutes. Roast sweet potatoes. Sauté asparagus in olive oil until fully tender.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.09), carbs_g: Math.round(c * 0.25), fat_g: Math.round(f * 0.27), videoSearch: "baked salmon and sweet potato cubes recipe home cooking" }
      ]
    },
    {
      day: "Tuesday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "Egg White Scramble & Toast", prepTime: "10 mins", ingredients: ["4 egg whites", "1 whole egg", "2 slices whole wheat bread", "50g chopped spinach", "10g real butter"], instructions: "Whisk eggs. Cook in butter with spinach. Serve on toasted whole grain bread slice.", calories: Math.round(calorieTarget * 0.24), protein_g: Math.round(p * 0.23), carbs_g: Math.round(c * 0.24), fat_g: Math.round(f * 0.22), videoSearch: "egg white spinach scramble high protein" },
        { mealType: "Mid-morning Snack", name: "Protein Fruit Power Bowl", prepTime: "5 mins", ingredients: ["150g low fat cottage cheese", "1/2 chopped apple", "10g walnuts", "cinnamon shake"], instructions: "Layer cinnamon on cottage cheese, fold in fresh sweet apple dices and walnuts.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.15), carbs_g: Math.round(c * 0.10), fat_g: Math.round(f * 0.12), videoSearch: "healthy sweet cottage cheese snack fruit" },
        { mealType: "Lunch", name: "Deluxe Beef Stir-Fry with Rice", prepTime: "15 mins", ingredients: ["120g ultra lean ground beef", "100g steamed jasmine rice", "100g bell pepper mixes", "2 tbsp low sodium soy sauce"], instructions: "Sauté bell peppers, add lean beef browning thoroughly. Fold in jasmine rice, pour soy sauce seasoning.", calories: Math.round(calorieTarget * 0.31), protein_g: Math.round(p * 0.30), carbs_g: Math.round(c * 0.31), fat_g: Math.round(f * 0.28), videoSearch: "max euceda lean beef stir fry and jasmine rice" },
        { mealType: "Evening Snack", name: "Almond Protein Shake Blend", prepTime: "5 mins", ingredients: ["1 scoop whey protein isocure", "200ml plain almond milk", "15g natural almond halves"], instructions: "Blend almond milk and sweet whey scoop with cold water. Eat almonds alongside toast.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.07), fat_g: Math.round(f * 0.16), videoSearch: "easy post workout almond whey milk shake" },
        { mealType: "Dinner", name: "Roasted Turkey Rice Medley", prepTime: "15 mins", ingredients: ["130g sliced roasted turkey breast", "100g quinoa bowl cooked", "120g stir fried zucchini slices", "1 tsp coconut oil cooking"], instructions: "Serve roasted turkey breast on bed of cooked quinoa, stir fry zucchini slices in coconut oil.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.14), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.22), videoSearch: "ground turkey meal prep with quinoa and zucchini" }
      ]
    },
    {
      day: "Wednesday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "High Protein Banana Oats", prepTime: "10 mins", ingredients: ["60g rolled oats", "1 scoop vanilla protein powder", "1 medium banana", "200ml skimmed milk", "10g chia seeds"], instructions: "Mix oats and milk, microwave for 2 minutes. Stir in protein powder, top with sliced banana and chia seeds.", calories: Math.round(calorieTarget * 0.25), protein_g: Math.round(p * 0.25), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.18), videoSearch: "home cooking show high protein breakfast banana oats" },
        { mealType: "Mid-morning Snack", name: "Greek Yogurt & Berries", prepTime: "5 mins", ingredients: ["200g fat-free Greek yogurt", "50g fresh blueberries", "15g dry almonds", "5g honey drizzle"], instructions: "In a bowl, layer Greek yogurt, top with Blueberries, chopped almonds, and a light honey drizzle.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.08), fat_g: Math.round(f * 0.15), videoSearch: "greek yogurt breakfast parfait live lean" },
        { mealType: "Lunch", name: "Lean Chicken Rice & Broccoli", prepTime: "15 mins", ingredients: ["150g grilled chicken breast", "100g cooked basmati rice", "100g steamed broccoli florets", "1 tsp olive oil for sautéing"], instructions: "Plate cooked rice. Sauté seasoned chicken in olive oil. Serve beside broccoli drizzled with light lemon.", calories: Math.round(calorieTarget * 0.30), protein_g: Math.round(p * 0.32), carbs_g: Math.round(c * 0.30), fat_g: Math.round(f * 0.25), videoSearch: "max euceda meal prep chicken brown rice broccoli" },
        { mealType: "Evening Snack", name: "Whey shake & Salted Rice Cakes", prepTime: "5 mins", ingredients: ["1 scoop whey concentrate isolate", "2 salted brown rice cakes", "10g organic peanut butter"], instructions: "Blend whey powder with ice water. Spread organic peanut butter evenly on rice cakes and enjoy.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.16), carbs_g: Math.round(c * 0.09), fat_g: Math.round(f * 0.15), videoSearch: "protein shake and rice cakes post workout snack" },
        { mealType: "Dinner", name: "Seasoned Baked Salmon & Sweet Potato", prepTime: "20 mins", ingredients: ["120g wild baked salmon fillet", "120g roasted sweet potato cubes", "150g fresh asparagus spears", "1 tsp healthy olive oil"], instructions: "Bake salmon at 200°C for 15 minutes. Roast sweet potatoes. Sauté asparagus in olive oil until fully tender.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.09), carbs_g: Math.round(c * 0.25), fat_g: Math.round(f * 0.27), videoSearch: "baked salmon and sweet potato cubes recipe home cooking" }
      ]
    },
    {
      day: "Thursday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "Egg White Scramble & Toast", prepTime: "10 mins", ingredients: ["4 egg whites", "1 whole egg", "2 slices whole wheat bread", "50g chopped spinach", "10g real butter"], instructions: "Whisk eggs. Cook in butter with spinach. Serve on toasted whole grain bread slice.", calories: Math.round(calorieTarget * 0.24), protein_g: Math.round(p * 0.23), carbs_g: Math.round(c * 0.24), fat_g: Math.round(f * 0.22), videoSearch: "egg white spinach scramble high protein" },
        { mealType: "Mid-morning Snack", name: "Protein Fruit Power Bowl", prepTime: "5 mins", ingredients: ["150g low fat cottage cheese", "1/2 chopped apple", "10g walnuts", "cinnamon shake"], instructions: "Layer cinnamon on cottage cheese, fold in fresh sweet apple dices and walnuts.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.15), carbs_g: Math.round(c * 0.10), fat_g: Math.round(f * 0.12), videoSearch: "healthy sweet cottage cheese snack fruit" },
        { mealType: "Lunch", name: "Deluxe Beef Stir-Fry with Rice", prepTime: "15 mins", ingredients: ["120g ultra lean ground beef", "100g steamed jasmine rice", "100g bell pepper mixes", "2 tbsp low sodium soy sauce"], instructions: "Sauté bell peppers, add lean beef browning thoroughly. Fold in jasmine rice, pour soy sauce seasoning.", calories: Math.round(calorieTarget * 0.31), protein_g: Math.round(p * 0.30), carbs_g: Math.round(c * 0.31), fat_g: Math.round(f * 0.28), videoSearch: "max euceda lean beef stir fry and jasmine rice" },
        { mealType: "Evening Snack", name: "Almond Protein Shake Blend", prepTime: "5 mins", ingredients: ["1 scoop whey protein isocure", "200ml plain almond milk", "15g natural almond halves"], instructions: "Blend almond milk and sweet whey scoop with cold water. Eat almonds alongside toast.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.07), fat_g: Math.round(f * 0.16), videoSearch: "easy post workout almond whey milk shake" },
        { mealType: "Dinner", name: "Roasted Turkey Rice Medley", prepTime: "15 mins", ingredients: ["130g sliced roasted turkey breast", "100g quinoa bowl cooked", "120g stir fried zucchini slices", "1 tsp coconut oil cooking"], instructions: "Serve roasted turkey breast on bed of cooked quinoa, stir fry zucchini slices in coconut oil.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.14), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.22), videoSearch: "ground turkey meal prep with quinoa and zucchini" }
      ]
    },
    {
      day: "Friday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "High Protein Banana Oats", prepTime: "10 mins", ingredients: ["60g rolled oats", "1 scoop vanilla protein powder", "1 medium banana", "200ml skimmed milk", "10g chia seeds"], instructions: "Mix oats and milk, microwave for 2 minutes. Stir in protein powder, top with sliced banana and chia seeds.", calories: Math.round(calorieTarget * 0.25), protein_g: Math.round(p * 0.25), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.18), videoSearch: "home cooking show high protein breakfast banana oats" },
        { mealType: "Mid-morning Snack", name: "Greek Yogurt & Berries", prepTime: "5 mins", ingredients: ["200g fat-free Greek yogurt", "50g fresh blueberries", "15g dry almonds", "5g honey drizzle"], instructions: "In a bowl, layer Greek yogurt, top with Blueberries, chopped almonds, and a light honey drizzle.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.08), fat_g: Math.round(f * 0.15), videoSearch: "greek yogurt breakfast parfait live lean" },
        { mealType: "Lunch", name: "Lean Chicken Rice & Broccoli", prepTime: "15 mins", ingredients: ["150g grilled chicken breast", "100g cooked basmati rice", "100g steamed broccoli florets", "1 tsp olive oil for sautéing"], instructions: "Plate cooked rice. Sauté seasoned chicken in olive oil. Serve beside broccoli drizzled with light lemon.", calories: Math.round(calorieTarget * 0.30), protein_g: Math.round(p * 0.32), carbs_g: Math.round(c * 0.30), fat_g: Math.round(f * 0.25), videoSearch: "max euceda meal prep chicken brown rice broccoli" },
        { mealType: "Evening Snack", name: "Whey shake & Salted Rice Cakes", prepTime: "5 mins", ingredients: ["1 scoop whey concentrate isolate", "2 salted brown rice cakes", "10g organic peanut butter"], instructions: "Blend whey powder with ice water. Spread organic peanut butter evenly on rice cakes and enjoy.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.16), carbs_g: Math.round(c * 0.09), fat_g: Math.round(f * 0.15), videoSearch: "protein shake and rice cakes post workout snack" },
        { mealType: "Dinner", name: "Seasoned Baked Salmon & Sweet Potato", prepTime: "20 mins", ingredients: ["120g wild baked salmon fillet", "120g roasted sweet potato cubes", "150g fresh asparagus spears", "1 tsp healthy olive oil"], instructions: "Bake salmon at 200°C for 15 minutes. Roast sweet potatoes. Sauté asparagus in olive oil until fully tender.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.09), carbs_g: Math.round(c * 0.25), fat_g: Math.round(f * 0.27), videoSearch: "baked salmon and sweet potato cubes recipe home cooking" }
      ]
    },
    {
      day: "Saturday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "Egg White Scramble & Toast", prepTime: "10 mins", ingredients: ["4 egg whites", "1 whole egg", "2 slices whole wheat bread", "50g chopped spinach", "10g real butter"], instructions: "Whisk eggs. Cook in butter with spinach. Serve on toasted whole grain bread slice.", calories: Math.round(calorieTarget * 0.24), protein_g: Math.round(p * 0.23), carbs_g: Math.round(c * 0.24), fat_g: Math.round(f * 0.22), videoSearch: "egg white spinach scramble high protein" },
        { mealType: "Mid-morning Snack", name: "Protein Fruit Power Bowl", prepTime: "5 mins", ingredients: ["150g low fat cottage cheese", "1/2 chopped apple", "10g walnuts", "cinnamon shake"], instructions: "Layer cinnamon on cottage cheese, fold in fresh sweet apple dices and walnuts.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.15), carbs_g: Math.round(c * 0.10), fat_g: Math.round(f * 0.12), videoSearch: "healthy sweet cottage cheese snack fruit" },
        { mealType: "Lunch", name: "Deluxe Beef Stir-Fry with Rice", prepTime: "15 mins", ingredients: ["120g ultra lean ground beef", "100g steamed jasmine rice", "100g bell pepper mixes", "2 tbsp low sodium soy sauce"], instructions: "Sauté bell peppers, add lean beef browning thoroughly. Fold in jasmine rice, pour soy sauce seasoning.", calories: Math.round(calorieTarget * 0.31), protein_g: Math.round(p * 0.30), carbs_g: Math.round(c * 0.31), fat_g: Math.round(f * 0.28), videoSearch: "max euceda lean beef stir fry and jasmine rice" },
        { mealType: "Evening Snack", name: "Almond Protein Shake Blend", prepTime: "5 mins", ingredients: ["1 scoop whey protein isocure", "200ml plain almond milk", "15g natural almond halves"], instructions: "Blend almond milk and sweet whey scoop with cold water. Eat almonds alongside toast.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.07), fat_g: Math.round(f * 0.16), videoSearch: "easy post workout almond whey milk shake" },
        { mealType: "Dinner", name: "Roasted Turkey Rice Medley", prepTime: "15 mins", ingredients: ["130g sliced roasted turkey breast", "100g quinoa bowl cooked", "120g stir fried zucchini slices", "1 tsp coconut oil cooking"], instructions: "Serve roasted turkey breast on bed of cooked quinoa, stir fry zucchini slices in coconut oil.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.14), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.22), videoSearch: "ground turkey meal prep with quinoa and zucchini" }
      ]
    },
    {
      day: "Sunday",
      totalCalories: calorieTarget,
      meals: [
        { mealType: "Breakfast", name: "High Protein Banana Oats", prepTime: "10 mins", ingredients: ["60g rolled oats", "1 scoop vanilla protein powder", "1 medium banana", "200ml skimmed milk", "10g chia seeds"], instructions: "Mix oats and milk, microwave for 2 minutes. Stir in protein powder, top with sliced banana and chia seeds.", calories: Math.round(calorieTarget * 0.25), protein_g: Math.round(p * 0.25), carbs_g: Math.round(c * 0.28), fat_g: Math.round(f * 0.18), videoSearch: "home cooking show high protein breakfast banana oats" },
        { mealType: "Mid-morning Snack", name: "Greek Yogurt & Berries", prepTime: "5 mins", ingredients: ["200g fat-free Greek yogurt", "50g fresh blueberries", "15g dry almonds", "5g honey drizzle"], instructions: "In a bowl, layer Greek yogurt, top with Blueberries, chopped almonds, and a light honey drizzle.", calories: Math.round(calorieTarget * 0.12), protein_g: Math.round(p * 0.18), carbs_g: Math.round(c * 0.08), fat_g: Math.round(f * 0.15), videoSearch: "greek yogurt breakfast parfait live lean" },
        { mealType: "Lunch", name: "Lean Chicken Rice & Broccoli", prepTime: "15 mins", ingredients: ["150g grilled chicken breast", "100g cooked basmati rice", "100g steamed broccoli florets", "1 tsp olive oil for sautéing"], instructions: "Plate cooked rice. Sauté seasoned chicken in olive oil. Serve beside broccoli drizzled with light lemon.", calories: Math.round(calorieTarget * 0.30), protein_g: Math.round(p * 0.32), carbs_g: Math.round(c * 0.30), fat_g: Math.round(f * 0.25), videoSearch: "max euceda meal prep chicken brown rice broccoli" },
        { mealType: "Evening Snack", name: "Whey shake & Salted Rice Cakes", prepTime: "5 mins", ingredients: ["1 scoop whey concentrate isolate", "2 salted brown rice cakes", "10g organic peanut butter"], instructions: "Blend whey powder with ice water. Spread organic peanut butter evenly on rice cakes and enjoy.", calories: Math.round(calorieTarget * 0.11), protein_g: Math.round(p * 0.16), carbs_g: Math.round(c * 0.09), fat_g: Math.round(f * 0.15), videoSearch: "protein shake and rice cakes post workout snack" },
        { mealType: "Dinner", name: "Seasoned Baked Salmon & Sweet Potato", prepTime: "20 mins", ingredients: ["120g wild baked salmon fillet", "120g roasted sweet potato cubes", "150g fresh asparagus spears", "1 tsp healthy olive oil"], instructions: "Bake salmon at 200°C for 15 minutes. Roast sweet potatoes. Sauté asparagus in olive oil until fully tender.", calories: Math.round(calorieTarget * 0.22), protein_g: Math.round(p * 0.09), carbs_g: Math.round(c * 0.25), fat_g: Math.round(f * 0.27), videoSearch: "baked salmon and sweet potato cubes recipe home cooking" }
      ]
    }
  ];
  
  return {
    macroSplit: { protein_g: p, carbs_g: c, fat_g: f },
    weekPlan
  };
}

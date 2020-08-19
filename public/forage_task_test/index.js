// create the timeline...

// need to add the consent stuff.
// edit instructions and preload instruction pages

// firebase stuff
firebase.firestore().enablePersistence().catch(function(err) {
    if (err.code == 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled
        // in one tab at a a time.
    } else if (err.code == 'unimplemented') {
        // The current browser does not support all of the
        // features required to enable persistence
    }
});

//firebase.auth().signInAnonymously(); // check that you can sign in...

// User ID
var uid;

function getQueryVariable(variable)
{
       var query = window.location.search.substring(1);
       var vars = query.split("&");
       for (var i=0;i<vars.length;i++) {
               var pair = vars[i].split("=");
               if(pair[0] == variable){return pair[1];}
       }
       return(false);
}

// get the prolific ID, // get task version - for counter-balancing
// get
if (window.location.search.indexOf('PROLIFIC_PID') > -1) {
  var subjectID = getQueryVariable('PROLIFIC_PID'); // check that this i a string or something...
}
else {
    var subjectID = Math.floor(Math.random() * (2000000 - 0 + 1)) + 0; // if no prolific ID, generate random ID (for testing)
}

if (window.location.search.indexOf('STUDY_ID') > -1) {
  var studyID = getQueryVariable('STUDY_ID'); // check that this i a string or something...
}
else {
    var studyID = Math.floor(Math.random() * (2000000 - 0 + 1)) + 0; // if no prolific ID, generate random ID (for testing)
}

if (window.location.search.indexOf('SESSION_ID') > -1) {
  var sessionID = getQueryVariable('SESSION_ID'); // check that this i a string or something...
}
else {
    var sessionID = Math.floor(Math.random() * (2000000 - 0 + 1)) + 0; // if no prolific ID, generate random ID (for testing)
}

if (window.location.search.indexOf('condID') > -1) {
  var condID = getQueryVariable('condID'); // check that this i a string or something...
}
else {
    var condID = 3; // if no prolific ID, generate random ID (for testing)
}

if (window.location.search.indexOf('tpID') > -1) {
  var tpID = getQueryVariable('tpID'); // check that this i a string or something...
}
else {
    var tpID = 3; // if no prolific ID, generate random ID (for testing)
}
var uid;
if (window.location.search.indexOf('uid') > -1) {
  console.log('found a UID!')
  var uid = getQueryVariable('uid'); // check that this i a string or something...
  firebase.auth().signInAnonymously();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      //uid = user.uid;
      task(uid);
    }
  })
}
else {
  console.log('no uid found')
  // When signed in, get the user ID
  firebase.auth().signInAnonymously();
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      uid = user.uid;
      task(uid);
    }
})
}

function task(uid){

  // get or generate a subjectID

  var max_stars = 10;
  var max_points = 20000;
  // get the database going
  // create a reference to the database
  var db = firebase.firestore();
  console.log(db)

  var run_name = 'tp1';

  // record new date and start time
  db.collection('lockintask').doc(run_name).collection('subjects').doc(uid).collection('foragetask').doc('start').set({
      subjectID: subjectID,  // this refers to the subject's ID from prolific/
      uid:uid,
      tpID: tpID,
      condID:condID,
      studyID: studyID,
      sessionID: sessionID,
      date: new Date().toLocaleDateString(),
      start_time: new Date().toLocaleTimeString()
  })

  var full_screen = {
    type: 'fullscreen',
    fullscreen_mode: true
  };

    var key_easy_im = "Stimuli/keys_Easy.png";
    var key_hard_im = "Stimuli/keys_Hard.png";
    // we'll vary the travel amount
    var reward_amounts = [53, 105];
    var reward_names = ['LOW', 'HIGH'];
    var travel_names = ['EASY', 'HARD'];
    var harvest_key_seq = ['u'];
    var harvest_prompt = ['u'];

    var travel_key_seq_hard = ['a'];
    var travel_hold_down_keys_hard = ['0', '9', 'm','t','e'];
    var travel_prompt_hard = ["Repeatedly press 'a' (left pinky) while holding down  't' , 'e' (left) and '0', '9', 'm' (right) to travel"];
    var harvest_prompt_hard =  ["Repeatedly press 'u' to harvest or 'a' to travel"];

    var travel_hold_down_keys_easy = ['0', '9', 'm'];
    var travel_key_seq_easy =['f'];
    var travel_prompt_easy = ["Repeatedly press 'f' (left index) while holding down '0', '9', 'm' (right) to travel"];
    var harvest_prompt_easy=  ["Repeatedly press 'u' to harvest or 'f' to travel"];

    var n_rounds = 2;

    var total_points_arr = [];

    var forage_trials = [];
    var trial_num = 0;
    for (r_idx = 0; r_idx < n_rounds; r_idx++){
      var this_round_trials = [];
      for (d_idx = 0; d_idx < 2; d_idx++){ // key difficulty...
        for (rew_idx = 0; rew_idx < reward_amounts.length; rew_idx++){ // travel index
          var this_rew_amount = reward_amounts[rew_idx];
          if (d_idx == 0){ // 0 is easy...
              var this_travel_key_seq = travel_key_seq_easy;
              var this_travel_prompt = travel_prompt_easy;
              var this_travel_held_down_keys = travel_hold_down_keys_easy;
              var this_harvest_prompt = harvest_prompt_easy;
              var key_im = key_easy_im;
          }else{ // 1 is hard...
            var this_travel_key_seq = travel_key_seq_hard;
            var this_travel_prompt = travel_prompt_hard;
            var this_travel_held_down_keys = travel_hold_down_keys_hard;
            var this_travel_prompt = travel_prompt_hard;
            var this_harvest_prompt = harvest_prompt_hard;
            var key_im = key_hard_im;
          }
          trial_num = trial_num + 1;
          var this_trial = {
            type: 'travel-mkre',
            start_reward: reward_amounts[rew_idx],
            decay: .96, // decay a good deal faster
            n_travel_steps: 13, // reduced this by X number of presses...
            press_success_prob_travel: .75,
            press_success_prob_harvest: .5, // this slows down the harvest...
            reward_noise: 2.5,
            start_reward_noise: 4,
            time_min: 1.75,//1.75,//2.34, // will change this...
            travel_key_seq:this_travel_key_seq,
            travel_prompt: this_travel_prompt,
            harvest_key_seq: harvest_key_seq,
            harvest_prompt: this_harvest_prompt,
            travel_held_down_keys: this_travel_held_down_keys,
            rew_idx: r_idx,
            d_idx: d_idx,
            reward_name: reward_names[rew_idx],
            travel_name: travel_names[d_idx],
            key_im: key_im
          }
          this_round_trials.push(this_trial)
        }
      }
      //forage_trials = forage_trials.concat(this_round_trials);
      forage_trials = forage_trials.concat(jsPsych.randomization.shuffle(this_round_trials,1));
    }



// add a trial num // this is correct.....
for (var i = 0;i < forage_trials.length;  i++){
  forage_trials[i].trial_num = i + 1;
}

//db.collection("tasks").doc('meg_generalisation_8').collection('subjects').doc(uid).collection('trial_data').doc('trial_' + trial_data.trial_number.toString()).set({trial_data});

// add a trial num
save_to_fb = true;
for (var i = 0;i < forage_trials.length;  i++){
  var trial_number = i + 1;
  forage_trials[i].on_finish = function(){
    //console.log(this.trial_num)
    var this_trial_data = jsPsych.data.get().filter({trial_num: this.trial_num}).json()
    //console.log(this_trial_data)
    if (save_to_fb){
      //console.log(this_trial_data)
      console.log('saving this trial')
      db.collection('lockintask').doc(run_name).collection('subjects').doc(uid).collection('foragetask').doc('trial_' + this.trial_num.toString()).set({
        trial_data: this_trial_data
      })
    }
  };
}



var make_start_trial = function(travel_prompt, harvest_prompt, rew_text, trial_num, key_image){
    var text_trial = {
      type: 'evan-display-text',
      line_1: "Traveling to the new environment",
      line_2: "Trees in this environment will all start with a " + rew_text + " number of points.",
      line_3: travel_prompt + ". Press 'u' to harvest",
      key_image: key_image
    }
  return text_trial
}

var make_summary_trial = function(travel_prompt, harvest_prompt, trial_num){
  var text_trial = {
    type: 'evan-display-text',
    line_1: function(){
      var lasttimelinedata = jsPsych.data.getLastTimelineData();
      var total_points = lasttimelinedata.values().pop().total_points
      total_points_arr.push(total_points);
      console.log(lasttimelinedata)
      //var max_stars = 10;
      //var Math.round(number * 10) / 10
      var nstars = Math.round(total_points*(max_stars / max_points));
      if (nstars > 10){nstars = 10};
      if (nstars < 2){nstars = 2};
      return "You collected " + total_points + " points and received " + nstars + " stars";
    },
    line_2: "Great work.",
    line_3: "You've completed " + (trial_num)+ " out of 8 rounds.",
    stars: function(){
      var npoints = total_points_arr[total_points_arr.length - 1];
      //var max_stars = 10;
      var nstars = Math.round(npoints*(max_stars / (max_points)));
      if (nstars > 10){nstars = 10};
      if (nstars < 2){nstars = 2};
      return nstars
    }
  }
  return text_trial
}

trials = forage_trials;
/* create timeline */
var timeline = [];
timeline.push(full_screen);

timeline = timeline.concat(intro_w_trials);

//for (i = 0; i < trials.length; i++){
//for (i = 0; i < 1; i++){
//  var next_task_trial = trials[i];

//  var info_trial = {
//    type: 'evan-select-env',
//    rew_cond: next_task_trial.reward_name,
  //  travel_cond: next_task_trial.travel_name
  //}

  //var next_trial_text = make_start_trial(next_task_trial.travel_prompt, next_task_trial.harvest_prompt,next_task_trial.reward_name, i + 1, next_task_trial.key_im);
  //var summary_trial = make_summary_trial(next_task_trial.travel_prompt, next_task_trial.harvest_prompt, i + 1);
  //timeline.push(info_trial);
  //timeline.push(next_trial_text);
  //timeline.push(next_task_trial);
  //timeline.push(summary_trial);
//}

  // compute bonus for the main task...
  var end_screen = {
   type: 'html-button-response',
      timing_post_trial: 0,
      choices: ['Continue'],
      is_html: true,
      stimulus: function(){

        var random_total_points = jsPsych.randomization.sampleWithoutReplacement(total_points_arr, 1);
        var nstars = Math.round(random_total_points*(max_stars / (max_points)));

        var string = 'You have finished the task.  \
                 Great work! If this worked, please start the actual task. \
              <b> PLEASE CLICK CONTINUE TO MOVE ONTO THE NEXT TASK </b>.';

          db.collection('lockintask').doc(run_name).collection('subjects').doc(uid).collection('foragetask').doc('end').set({
                bonus_points: random_total_points,
                end_time:  new Date().toLocaleTimeString()
              })
     return string;
    },
     on_finish: function(){
       if (parseInt(condID) == 1){ // if we're in first conditon, go to the
         var nextlink = "https://lockinstudy.firebaseapp.com/grid_task/?PROLIFIC_PID=" +
          subjectID + "&STUDY_ID=" + studyID +  "&SESSION_ID=" + sessionID +
           "&uid=" + uid + "&tpID=" + tpID  + "&condID=" + condID;
       }else{
         var nextlink = "https://lockinstudy.firebaseapp.com/q_task/?PROLIFIC_PID=" +
          subjectID + "&STUDY_ID=" + studyID +  "&SESSION_ID=" + sessionID +
           "&uid=" + uid + "&tpID=" + tpID  + "&condID=" + condID;
       }

       //window.location = nextlink;
     }
  }
  timeline.push(end_screen)

  // recording data...

  // need a screen thanking them for the task and also figuring out the bonus... -- do this tonight
  var instruc_images = instruction_pagelinks_a.concat(instruction_pagelinks_b);
  instruc_images = instruc_images.concat(instruction_pagelinks_c);
  instruc_images.push("Stimuli/warrior.svg");
  instruc_images.push(key_easy_im);
  instruc_images.push(key_hard_im);


console.log(timeline)

  /* start the experiment */
  jsPsych.init({
    timeline: timeline,
    preload_images: instruc_images,
    show_preload_progress_bar: true,
    on_finish: function() {
      console.log('done')
      // download many files...?
      //jsPsych.data.get().localSave('csv','test_res.csv');
    //on_finish: saveData
    }
  });

}

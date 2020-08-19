/*
 * Example plugin template
 */

jsPsych.plugins["evan-display-text"] = (function() {

  var plugin = {};

  plugin.info = {
    name: "evan-display-text",
    parameters: {
      line_1: {
        type: jsPsych.plugins.parameterType.STRING, // BOOL, STRING, INT, FLOAT, FUNCTION, KEYCODE, SELECT, HTML_STRING, IMAGE, AUDIO, VIDEO, OBJECT, COMPLEX
        default: ''
      },
      line_2: {
        type: jsPsych.plugins.parameterType.STRING,
        default: ''
    },
    line_3: {
      type: jsPsych.plugins.parameterType.STRING,
      default: ''
    },
    wait_for_press: {
      type: jsPsych.plugins.parameterType.BOOL,
      default: true
    },
    key_image:{
      type: jsPsych.plugins.parameterType.IMAGE,
      default: ''
    },
    stars:{
      type: jsPsych.plugins.parameterType.INT,
      default: 0
    }
  }
}

  plugin.trial = function(display_element, trial) {

    var star_img = "Stimuli/star.png";

    // define the response that we'll append
    var response = {
        rt: null,
        key: null
      };


    var wait_for_time = function(n_msec, next_fun){
      // wait n_msec and then call next function
      jsPsych.pluginAPI.setTimeout(function() {
          next_fun() //
        }, n_msec);
    } // end wait for time


    // get params
    var par = define_parameters('trial');
    par.text_font_size = 50;


    var svg = d3.select(".jspsych-content-wrapper")
                .append("svg")
                .attr("width", par.w)
                .attr("height", par.h)

    // place grey background on it
    d3.select("svg").append("rect")
          .attr("x", 0).attr("y", 0).attr("width", par.w)
          .attr("height", par.h).style("fill", par.svg_color).style("opacity",.7);

    place_text(trial.line_1, 'text', par.w/2, par.h/2 - 4*par.text_font_size, par.text_font_size/2, 1, "White");
    place_text(trial.line_2, 'text', par.w/2, par.h/2 - 3*par.text_font_size, par.text_font_size/2, 1, "White");
    place_text(trial.line_3, 'text', par.w/2, par.h/2 - 2*par.text_font_size, par.text_font_size/2, 1, "White");

    place_img(trial.key_image, "keys", par.w/2 - 3*par.w/20,par.h/2 - par.text_font_size,
              3*par.w/10, 3*par.h/10, 1);

    //trial.stars = 5;
    if (trial.stars > 0){
      for (i = 0; i<trial.stars; i++){
        place_img(star_img, "star", par.w/2 - 21*par.w/80 + i*3*par.w/40,par.h/2 - par.text_font_size,
                  3*par.w/40, 3*par.h/10, 1);
      }

    }
    ///////////////////////////////////////


    // put up the svg


    var valid_responses = ['4'];

    if (trial.wait_for_press){
      // set up max response time?
      var txt_y =  .8*par.h;
      var prompt = 'Press 4 to continue'
      place_text(prompt, "prompt", par.w/2, txt_y, 28, 1, "White")

      var handle_response = function(info){
        jsPsych.pluginAPI.clearAllTimeouts();

        if (response.key == null) {
            response = info;
        }

        // data saving
        var trial_data = {
          // add time to this...
          line_1: trial.line_1,
          line_2: trial.line_2,
          line_3: trial.line_3,
          rt: response.rt
        };


        // kill keyboard listeners
        if (typeof keyboardListener !== 'undefined') {
          jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
        }

        d3.select('svg').remove(); jsPsych.finishTrial(trial_data);
      }

      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
          callback_function: handle_response,
          valid_responses: valid_responses,
          rt_method: 'performance', // check this
          persist: false,
          allow_held_key: false
        });
    }else{
      wait_for_time(par.text_info_prac_time,function(){ d3.select('svg').remove(); jsPsych.finishTrial(trial_data);});
    }


  };

  return plugin;
})();

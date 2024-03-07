# Sample Code: Command line C++ Typing Test

This is a short program intended as a code sample and demonstration of engineering practices for Jason Foat.

This is a simple command line application to facilitate the memorization of the (ever growing) list C++ of keywords. [^1] 
The intent is to stimulate kinesthetic learning by typing keywords for speed. Upon execution you'll be prompted with a key word, 
which you must type in accurately in order to advance to the next. And so on. After completion of all the keywords, you're 
then presented with your speed measured in WPM, and given the option to save the time to a leaderboard stored locally.

[^1]: Current through C++20.


To compile:
```
make
```
Useage:
```
      usage: ./type_cpp [-n num_words] [-f score_file] [-p]

        -n num_words: Number of words to use in test, if less than total.
                    (Must be less than the total number of keywords and greater than 0.
                    Ignored otherwise.)
        -f score_file: File to load scores from, creates if it doesn't exist.
                     (If not specified, uses default)
        -p: Print the default score file name.
```

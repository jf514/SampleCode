#include "ScoreManager.h"

#include <iostream>
#include <fstream>
#include <sstream>

bool ScoreManager::load() 
{   
    // JEF: BAD don't do this
    using namespace std;

    // NOTE: The code below is mostly stolen
    // from CSE 100R Project #2

    ifstream my_file(filename);      // open the file
    if(!my_file.is_open())
        return false;

    string line;                     // helper var to store current line
    while(getline(my_file, line)) {  // read one line from the file
        istringstream ss(line);      // create istringstream of current line
        string first, second, third; // helper vars
        getline(ss, first, ',');     // store first column in "first"
        getline(ss, second, ',');    // store second column in "second"
        getline(ss, third, '\n');    // store third column column in "third"

        scores[stof(first)] = {second, third};
    }

    cout << "Read " << scores.size() << " scores. \n"; 
    my_file.close();

    return true;
} 

void ScoreManager::addScore(const std::string& name, float score, const std::string& date)
{
    scores[score] = {name, date};
}

size_t ScoreManager::getScoreRank(float score)
{
    auto it = scores.lower_bound(score);
    auto rank = std::distance(scores.begin(), it); 
    std::cout << "Score ranks " <<  rank + 1 << " of " << scores.size() + 1 << "\n";
    return rank;
}

bool ScoreManager::write() 
{ 
    std::ofstream outfile(filename);

    for(const auto& ele : scores)
    {
        outfile << ele.first << "," << ele.second.name << "," << ele.second.date << std::endl; 
    }

    outfile.close();

    return true; 
}
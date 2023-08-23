#ifndef JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
#define JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
#pragma once

#include <map>
#include <string>

class ScoreManager
{
public:
    explicit ScoreManager(const char* filename) :
        filename(filename) {}

    bool load();
    void addScore(const std::string& name, float score, const std::string& date);
    size_t getScoreRank(float score);
    bool write();

private:
    const std::string filename;

    struct ScoreInfo {
        std::string name;
        std::string date;
    };

    std::map<float, ScoreInfo, std::greater<float>> scores;
};

#endif // JASONS_SAMPLE_CODE_CPP_TYPING_TEST_CPP_TYPING_TEST_H
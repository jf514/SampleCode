#!/bin/sh

###################################
# Builds and runs example test
###################################

echo "Building Example_Sim..."
clang++ ./Example_Sim.cpp -std=c++17 -o Example_Sim -Wall
echo "Done."

echo "Running Example_Sim..."
./Example_Sim
echo "Done."


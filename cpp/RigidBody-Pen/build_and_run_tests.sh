#!/bin/sh

####################################
# Builds and runs all unit test code
####################################

echo "Building Integrators_Test..."
clang++ ./Integrators_Test.cpp -std=c++17 -o Integrators_Test -Wall
echo "Done."

echo "Building DynamicEntities_Test..."
clang++ ./DynamicEntities_Test.cpp -std=c++17 -o DynamicEntities_Test -Wall
echo "Done."

echo "Building Simulation_Test..."
clang++ ./Simulation_Test.cpp -std=c++17 -o Simulation_Test
echo "Done."

echo "Running Integrators_Test..."
./Integrators_Test
echo "Done."

echo "Running DynamicEntities_Test..."
./DynamicEntities_Test
echo "Done."

echo "Running Simulation_Test..."
./Simulation_Test
echo "Done."
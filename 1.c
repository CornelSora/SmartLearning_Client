#include<stdio.h>
int main() {
    int x = 10;
    int a = 2;
    int b = 3;
    int sum = 0;
    sum = sum + x;
    sum += a + b;
    a = b + x;
    b = x - a;
    printf("Hello world!");
}

import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Modal, TouchableOpacity } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import { especialidades } from '../../constants/Especialidades';
import { useRouter } from 'expo-router';

export default function CargaEspecialista() {
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSpeciality, setSelectedSpeciality] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const router = useRouter();

  const validationSchema = yup.object().shape({
    name: yup.string().required('El nombre es requerido'),
    apellido: yup.string().required('El apellido es requerido'),
    dni: yup.string().required('El DNI es requerido'),
    sucursalId: yup.number().required('La sucursal es requerida'),
  });

  const initialValues = {
    name: '',
    apellido: '',
    dni: '',
    especialidad: '',
    sucursalId: '',
  };

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const sucursales = [
    { id: 1, nombre: 'Sucursal A' },
    { id: 2, nombre: 'Sucursal B' },
    { id: 3, nombre: 'Sucursal C' },
    { id: 4, nombre: 'Sucursal D' },
  ];

  const handleSubmit = async (values, { resetForm }) => {
    try {
      const response = await fetch('https://672aac9d976a834dd024100f.mockapi.io/api/especialistas/especialistas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          especialidad: selectedSpeciality,
          diasAtencion: selectedDays,
          activo: true,
          turnoId: []
        }),
      });

      if (response.ok) {
        resetForm({ values: initialValues });
        setSelectedDays([]);
        setSelectedSpeciality("");
        setModalVisible(true);
      } else {
        throw new Error('Error al crear el profesional');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleContinue = () => {
    setModalVisible(false);
  };

  const handleGoHome = () => {
    setModalVisible(false);
    router.push('/(tabs)');
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ handleChange, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.container}>
            <Text style={styles.title}>Registro de Especialista</Text>

            <View style={styles.inputContainer}>
              <Text>Nombre</Text>
              <TextInput
                style={styles.input}
                value={values.name}
                onChangeText={handleChange('name')}
                placeholder="Ingrese nombre"
              />
              {touched.name && errors.name && (
                <Text style={styles.errorText}>{errors.name}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text>Apellido</Text>
              <TextInput
                style={styles.input}
                value={values.apellido}
                onChangeText={handleChange('apellido')}
                placeholder="Ingrese apellido"
              />
              {touched.apellido && errors.apellido && (
                <Text style={styles.errorText}>{errors.apellido}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text>Especialidad</Text>
              <Picker
                selectedValue={selectedSpeciality}
                onValueChange={(itemValue) => setSelectedSpeciality(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label={selectedSpeciality ? selectedSpeciality : 'Seleccione la especialidad'} value="" />
                {especialidades.sort().map((especialidad) => (
                  <Picker.Item key={especialidad} label={especialidad} value={especialidad} />
                ))}
              </Picker>
            </View>

            <View style={styles.inputContainer}>
              <Text>DNI</Text>
              <TextInput
                style={styles.input}
                value={values.dni}
                onChangeText={handleChange('dni')}
                placeholder="Ingrese DNI"
                keyboardType="numeric"
              />
              {touched.dni && errors.dni && (
                <Text style={styles.errorText}>{errors.dni}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text>Sucursal</Text>
              <Picker
                selectedValue={values.sucursalId}
                onValueChange={(itemValue) => setFieldValue('sucursalId', itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccione una sucursal" value="" />
                {sucursales.map((sucursal) => (
                  <Picker.Item
                    key={sucursal.id}
                    label={sucursal.nombre}
                    value={sucursal.id}
                  />
                ))}
              </Picker>
              {touched.sucursalId && errors.sucursalId && (
                <Text style={styles.errorText}>{errors.sucursalId}</Text>
              )}
            </View>

            <View style={styles.inputContainer}>
  <Text>Días de Atención</Text>
  <Picker
    selectedValue=""
    onValueChange={(itemValue) => {
      if (itemValue && !selectedDays.includes(itemValue)) {
        setSelectedDays([...selectedDays, itemValue].sort((a, b) => {
          const orden = {
            'Lunes': 1,
            'Martes': 2,
            'Miércoles': 3,
            'Jueves': 4,
            'Viernes': 5,
            'Sábado': 6,
            'Domingo': 7
          };
          return orden[a] - orden[b];
        }));
      }
    }}
    style={styles.picker}
  >
    <Picker.Item label="Seleccione los días" value="" />
    {diasSemana
      .filter(dia => !selectedDays.includes(dia))
      .map((dia) => (
        <Picker.Item key={dia} label={dia} value={dia} />
    ))}
  </Picker>
</View>

{selectedDays.length > 0 && (
  <View style={styles.selectedDaysContainer}>
    <Text style={styles.selectedDaysTitle}>Días seleccionados:</Text>
    <View style={styles.daysContainer}>
      {selectedDays.map((dia, index) => (
        <View key={index} style={styles.dayItem}>
          <Text style={styles.dayText}>{dia}</Text>
          <TouchableOpacity
            onPress={() => setSelectedDays(selectedDays.filter(d => d !== dia))}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>×</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
    <TouchableOpacity
      style={styles.clearButton}
      onPress={() => setSelectedDays([])}
    >
      <Text style={styles.clearButtonText}>Limpiar días</Text>
    </TouchableOpacity>
  </View>
)}

            <Button title="Guardar Especialista" onPress={handleSubmit} />
          </View>
        )}
      </Formik>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>¡Profesional creado exitosamente!</Text>
            <Text style={styles.modalText}>¿Qué deseas hacer?</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.continueButton]}
                onPress={handleContinue}
              >
                <Text style={styles.buttonText}>Cargar otro profesional</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.homeButton]}
                onPress={handleGoHome}
              >
                <Text style={styles.buttonText}>Volver al inicio</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    marginTop: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  selectedDaysContainer: {
    marginTop: 10,
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#2d4150',
  },
  modalText: {
    marginBottom: 20,
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalButton: {
    borderRadius: 10,
    padding: 12,
    width: '100%',
    alignItems: 'center',
    elevation: 2,
  },
  continueButton: {
    backgroundColor: '#4CAF50',
  },
  homeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  selectedDaysTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  dayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  dayText: {
    color: '#2d4150',
    marginRight: 5,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ff5252',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  clearButtonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  }
});
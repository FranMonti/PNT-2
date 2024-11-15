import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, Switch, ActivityIndicator, FlatList } from 'react-native';
import { Formik } from 'formik';
import * as yup from 'yup';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';

export default function EditarEspecialista() {
  const [especialistas, setEspecialistas] = useState([]);
  const [filteredEspecialistas, setFilteredEspecialistas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedEspecialista, setSelectedEspecialista] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedSucursalFilter, setSelectedSucursalFilter] = useState('');
  const router = useRouter();

  const validationSchema = yup.object().shape({
    sucursalId: yup.number().required('La sucursal es requerida'),
  });

  const diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
  ];

  const sucursales = [
    { id: 1, nombre: 'Sucursal A' },
    { id: 2, nombre: 'Sucursal B' },
    { id: 3, nombre: 'Sucursal C' },
    { id: 4, nombre: 'Sucursal D' },
  ];

  useEffect(() => {
    getEspecialistas();
  }, []);

  useEffect(() => {
    filterAndSortEspecialistas();
  }, [selectedSucursalFilter, especialistas]);

  const getEspecialistas = async () => {
    try {
      const response = await fetch('https://672aac9d976a834dd024100f.mockapi.io/api/especialistas/especialistas');
      const data = await response.json();
      setEspecialistas(data);
      setLoading(false);
    } catch (error) {
      console.error('Error al obtener especialistas:', error);
      setLoading(false);
    }
  };

  const filterAndSortEspecialistas = () => {
    if (!especialistas || especialistas.length === 0) {
      setFilteredEspecialistas([]);
      return;
    }

    let filtered = [...especialistas];

    if (selectedSucursalFilter) {
      filtered = filtered.filter(esp =>
        esp && esp.sucursalId && esp.sucursalId === Number(selectedSucursalFilter)
      );
    }

    filtered = filtered.filter(esp => esp && esp.apellido && esp.name);

    filtered.sort((a, b) => {
      if (!a.apellido || !b.apellido) return 0;
      const apellidoComparison = a.apellido.localeCompare(b.apellido);
      if (apellidoComparison !== 0) return apellidoComparison;
      return (a.name || '').localeCompare(b.name || '');
    });

    setFilteredEspecialistas(filtered);
  };

  const handleEditEspecialista = (especialista) => {
    if (especialista) {
      setSelectedEspecialista(especialista);
      setSelectedDays(especialista.diasAtencion || []);
      setModalVisible(true);
    }
  };

  const handleSubmit = async (values) => {
    if (!selectedEspecialista || !selectedEspecialista.id) {
      alert('Error: No se puede identificar al especialista');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `https://672aac9d976a834dd024100f.mockapi.io/api/especialistas/especialistas/${selectedEspecialista.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sucursalId: values.sucursalId || null,
            diasAtencion: selectedDays || [],
            activo: Boolean(values.activo),
          }),
        }
      );

      if (response.ok) {
        alert('Especialista actualizado exitosamente');
        setModalVisible(false);
        await getEspecialistas();
      } else {
        throw new Error('Error al actualizar el especialista');
      }
    } catch (error) {
      alert('Error: ' + (error.message || 'Error desconocido'));
    } finally {
      setLoading(false);
    }
  };

  const renderEspecialista = ({ item }) => (
    <TouchableOpacity
      style={styles.especialistaCard}
      onPress={() => handleEditEspecialista(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.nombreText}>{item.apellido}, {item.name}</Text>
        <View style={[styles.estadoIndicador,
        { backgroundColor: item.activo ? '#4CAF50' : '#ff5252' }]}
        />
      </View>
      <Text style={styles.especialidadText}>{item.especialidad}</Text>
      <Text style={styles.sucursalText}>
        Sucursal: {item.sucursalId && sucursales.find(s => s.id === item.sucursalId)?.nombre || 'No asignada'}
      </Text>
      <Text style={styles.diasText}>
        Días: {item.diasAtencion && item.diasAtencion.length > 0 ? item.diasAtencion.join(', ') : 'No asignados'}
      </Text>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <View style={styles.filterContainer}>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedSucursalFilter}
          onValueChange={(itemValue) => {
            if (itemValue === 'vacio') {
              setSelectedSucursalFilter(''); 
            } else {
              setSelectedSucursalFilter(itemValue);
            }
          }}
          style={styles.filterPicker}
        >
          <Picker.Item label="Todas las sucursales" value='vacio' />
          {sucursales.map((sucursal) => (
            <Picker.Item
              key={sucursal.id.toString()}
              label={sucursal.nombre}
              value={sucursal.id.toString()}
            />
          ))}
        </Picker>
      </View>
    </View>
  );

  const EmptyListMessage = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No se encontraron especialistas</Text>
      {selectedSucursalFilter !== '' && (
        <TouchableOpacity
          style={styles.clearFilterButton}
          onPress={() => setSelectedSucursalFilter('')}
        >
          <Text style={styles.clearFilterText}>Limpiar filtros</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading && !modalVisible) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  console.log('filt4ro aplicado: ', selectedSucursalFilter);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Especialistas</Text>

      <ListHeader />

      <FlatList
        data={filteredEspecialistas}
        renderItem={renderEspecialista}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={EmptyListMessage}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <ScrollView style={styles.modalScroll}>
              {selectedEspecialista && (
                <>
                  <Text style={styles.modalTitle}>Editar Especialista</Text>

                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Información del Profesional</Text>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Nombre:</Text>
                      <Text style={styles.value}>
                        {selectedEspecialista.name && selectedEspecialista.apellido ?
                          `${selectedEspecialista.name} ${selectedEspecialista.apellido}` :
                          'No disponible'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>DNI:</Text>
                      <Text style={styles.value}>
                        {selectedEspecialista.dni || 'No disponible'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.label}>Especialidad:</Text>
                      <Text style={styles.value}>
                        {selectedEspecialista.especialidad || 'No disponible'}
                      </Text>
                    </View>
                  </View>

                  <Formik
                    initialValues={{
                      sucursalId: selectedEspecialista?.sucursalId || '',
                      activo: selectedEspecialista?.activo || false,
                    }}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                  >
                    {({ handleSubmit, values, setFieldValue, errors, touched }) => (
                      <View style={styles.formSection}>
                        <View style={styles.switchContainer}>
                          <Text style={styles.switchLabel}>Estado del profesional</Text>
                          <Switch
                            value={values.activo}
                            onValueChange={(value) => setFieldValue('activo', value)}
                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                            thumbColor={values.activo ? '#4CAF50' : '#f4f3f4'}
                          />
                          <Text style={styles.switchText}>
                            {values.activo ? 'Activo' : 'Inactivo'}
                          </Text>
                        </View>

                        <View style={styles.inputContainer}>
                          <Text style={styles.label}>Sucursal</Text>
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
                          <Text style={styles.label}>Días de Atención</Text>
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
                          </View>
                        )}

                        <View style={styles.buttonContainer}>
                          <TouchableOpacity
                            style={[styles.button, styles.cancelButton]}
                            onPress={() => setModalVisible(false)}
                          >
                            <Text style={styles.buttonText}>Cancelar</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.button, styles.saveButton]}
                            onPress={handleSubmit}
                          >
                            <Text style={styles.buttonText}>Guardar</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}
                  </Formik>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 20,
    color: '#2d4150',
  },
  listContainer: {
    padding: 10,
  },
  especialistaCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  nombreText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d4150',
  },
  estadoIndicador: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  especialidadText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  sucursalText: {
    fontSize: 14,
    color: '#666',
  },
  diasText: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalScroll: {
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2d4150',
    textAlign: 'center',
  },
  infoSection: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d4150',
  },
  infoRow: {
    flexDirection: 'row',
    padding: 5,
  },
  label: {
    flex: 1,
    fontWeight: '600',
    color: '#666',
  },
  value: {
    flex: 2,
    color: '#2d4150',
  },
  formSection: {
    marginTop: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 15,
  },
  switchLabel: {
    flex: 1,
    fontSize: 16,
    color: '#2d4150',
  },
  switchText: {
    marginLeft: 10,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 15,
  },
  picker: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginTop: 5,
  },
  selectedDaysContainer: {
    marginTop: 15,
  },
  selectedDaysTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
  },
  cancelButton: {
    backgroundColor: '#ff5252',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#ff5252',
    fontSize: 12,
    marginTop: 5,
  },
});